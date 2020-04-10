require("isomorphic-fetch");
import OPDSParser, { OPDSFeed } from "opds-feed-parser";
import { Link, LibraryData } from "../interfaces";
import { parseLinks } from "../utils/libraryLinks";

export interface RegistryEntry {
  links: Link[];
  metadata?: {
    updated: string;
    id: string;
    title: string;
  };
}

export interface AuthDocument {
  title: string;
  links: Link[];
  // eslint-disable-next-line camelcase
  web_color_scheme?: {
    background?: string;
    foreground?: string;
  };
}

export interface CacheEntry {
  registryEntry?: RegistryEntry;
  catalog?: OPDSFeed;
  authDocument?: AuthDocument;
  timestamp: number;
}

type Config = { [key: string]: string };
export default class LibraryDataCache {
  // An in-memory cache of registry entries and authentication documents.
  // Registry entries don't change very often, and it's fine to fetch them
  // Again if we restart the server. It's also not a problem if simultaneous
  // Requests update the same registry entry, since they'll get the same
  // Data from the registry.
  private readonly CACHE: { [key: string]: CacheEntry } = {};
  private readonly registryBase?: string;
  private readonly expirationSeconds: number;
  private readonly config?: Config;
  protected libraryUrlTemplate: string | null = null;

  /**
    Create a LibraryDataCache for a registry or from a configuration file.

    registryBase: The base URL for a library registry.
    expirationSeconds: The number of seconds to cache registry entries and auth documents.
    config: A pre-configured mapping from library paths to circulation manager URLs.
  */
  constructor(
    registryBase?: string,
    expirationSeconds: number = 60 * 60 * 24,
    config?: Config
  ) {
    this.registryBase = registryBase;
    this.expirationSeconds = expirationSeconds;
    this.config = config;
  }

  async getLibraryUrlTemplate(): Promise<string> {
    if (!this.registryBase) {
      throw new Error(
        "Attempting to fetch registryResponse without process.env.REGISTRY_BASE"
      );
    }
    if (!this.libraryUrlTemplate) {
      try {
        const registryResponse = await fetch(this.registryBase);
        const registryCatalog = await registryResponse.json();
        const links = registryCatalog.links;
        for (const link of links) {
          if (
            link.rel === "http://librarysimplified.org/rel/registry/library"
          ) {
            this.libraryUrlTemplate = link.href;
            break;
          }
        }
      } catch (error) {
        throw new Error("Library registry is not available.");
      }
    }
    // if it still not available, throw the same error
    if (!this.libraryUrlTemplate) {
      throw new Error("Library registry not available");
    }
    return this.libraryUrlTemplate;
  }

  getDataFromAuthDocumentAndCatalog(
    authDocument: AuthDocument,
    catalog: OPDSFeed
  ) {
    let logoUrl: string | undefined;
    const cssLinks: Link[] = [];
    const headerLinks: Link[] = [];

    for (const link of authDocument.links) {
      if (link.rel === "logo") {
        logoUrl = link.href;
      } else if (link.rel === "stylesheet") {
        cssLinks.push(link);
      }
    }

    for (const link of catalog["links"]) {
      if (link.role === "navigation") {
        headerLinks?.push(link);
      }
    }

    const libraryLinks = parseLinks(authDocument.links);

    return {
      catalogName: authDocument["title"],
      colors: authDocument["web_color_scheme"],
      headerLinks,
      cssLinks,
      logoUrl,
      libraryLinks
    };
  }

  async getLibraryData(library: string): Promise<LibraryData> {
    const entry = await this.getCacheEntry(library);
    let catalogUrl;
    let catalogName;
    if (Object.keys(this.config || {}).length) {
      catalogUrl = this.config?.[library];
    } else {
      for (const link of entry?.registryEntry?.links ?? []) {
        if (link.rel === "http://opds-spec.org/catalog") {
          catalogUrl = link.href;
          break;
        }
      }
      catalogName = entry.registryEntry?.metadata?.title;
    }

    if (!entry.authDocument || !entry.catalog) {
      throw new Error("AuthDocument or Catalog not provided in getLibraryData");
    }

    return {
      id: library,
      catalogUrl,
      catalogName,
      ...this.getDataFromAuthDocumentAndCatalog(
        entry.authDocument,
        entry.catalog
      )
    };
  }

  async getCacheEntry(library: string): Promise<CacheEntry> {
    // Make sure the library is cached.
    const currentEntry = this.CACHE[library];
    const now = new Date().getTime();

    if (
      !currentEntry ||
      currentEntry.timestamp + this.expirationSeconds * 1000 < now
    ) {
      let registryEntry;
      let catalogUrl;
      if (this.registryBase) {
        registryEntry = await this.getRegistryEntry(library);
        // Find the catalog root in the registry entry.
        for (const link of registryEntry["links"]) {
          if (link.rel === "http://opds-spec.org/catalog") {
            catalogUrl = link.href;
            break;
          }
        }
        if (!catalogUrl) {
          throw new Error("Registry entry does not have a catalog URL");
        }
      } else if (this.config) {
        catalogUrl = this.config[library];
        if (!catalogUrl) {
          throw new Error("No catalog is configured for library " + library);
        }
      }

      let catalog = currentEntry && currentEntry.catalog;
      try {
        catalog = await this.getCatalog(catalogUrl);
      } catch (catalogError) {
        // If we can't get the catalog, patrons won't be able to use the application
        // Anyway.
        console.warn(catalogError);
        throw new Error("This library is not available.");
      }

      let authDocument = currentEntry && currentEntry.authDocument;
      try {
        authDocument = await this.getAuthDocument(catalog);
      } catch (authDocError) {
        // If we can't get the authentication document, keep the previous cached
        // Version or proceed without one.
        console.warn(authDocError);
      }

      this.CACHE[library] = {
        registryEntry,
        catalog,
        authDocument,
        timestamp: new Date().getTime()
      };
    }

    return this.CACHE[library];
  }

  async getRegistryEntry(library: string): Promise<void> {
    const template = await this.getLibraryUrlTemplate();
    const libraryUrl = template.replace("{uuid}", library);
    try {
      const registryResponse = await fetch(libraryUrl);
      const registryCatalog = await registryResponse.json();
      if (!registryCatalog.catalogs || registryCatalog.catalogs.length !== 1) {
        throw new Error(
          "Registry did not return a catalog for this library id: " + library
        );
      }
      const registryEntry = registryCatalog.catalogs[0];
      return registryEntry;
    } catch (error) {
      console.warn(error);
      throw new Error("This library is not available.");
    }
  }

  async getCatalog(rootUrl: string): Promise<OPDSFeed> {
    let catalog: OPDSFeed | null = null;
    try {
      const catalogResponse = await fetch(rootUrl);
      const rawCatalog = await catalogResponse.text();
      const parser = new OPDSParser();
      const parsedCatalog = await parser.parse(rawCatalog);
      if (parsedCatalog instanceof OPDSFeed) {
        catalog = parsedCatalog;
      }
    } catch (error) {
      throw new Error("Could not get OPDS catalog at " + rootUrl);
    }
    if (!catalog) {
      throw new Error("Could not get OPDS catalog at " + rootUrl);
    }
    return catalog;
  }

  async getAuthDocument(catalog: OPDSFeed): Promise<AuthDocument> {
    // Find the auth document link.
    let authDocLink;
    for (const link of catalog["links"]) {
      if (link.rel === "http://opds-spec.org/auth/document") {
        authDocLink = link.href;
        break;
      }
    }
    if (!authDocLink) {
      throw new Error("Could not find authentication document in OPDS catalog");
    }
    try {
      const authDocResponse = await fetch(authDocLink);
      const authDoc = await authDocResponse.json();
      return authDoc;
    } catch (error) {
      throw new Error(
        "Could not get authentication document at " + authDocLink
      );
    }
  }
}
