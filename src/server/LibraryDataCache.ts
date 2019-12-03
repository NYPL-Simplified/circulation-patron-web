require("isomorphic-fetch");
import OPDSParser, { OPDSFeed } from "opds-feed-parser";
import { Link, LibraryData } from "../interfaces";

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

export default class LibraryDataCache {
  // An in-memory cache of registry entries and authentication documents.
  // Registry entries don't change very often, and it's fine to fetch them
  // again if we restart the server. It's also not a problem if simultaneous
  // requests update the same registry entry, since they'll get the same
  // data from the registry.
  private readonly CACHE: { [key: string]: CacheEntry } = {};
  private readonly registryBase: string;
  private readonly expirationSeconds: number;
  private readonly config: { [key: string]: string };
  protected libraryUrlTemplate: string = null;

  /**
    Create a LibraryDataCache for a registry or from a configuration file.

    registryBase: The base URL for a library registry.
    expirationSeconds: The number of seconds to cache registry entries and auth documents.
    config: A pre-configured mapping from library paths to circulation manager URLs.
  */
  constructor(
    registryBase: string,
    expirationSeconds: number = 60 * 60 * 24,
    config?: { [key: string]: string }
  ) {
    this.registryBase = registryBase;
    this.expirationSeconds = expirationSeconds;
    this.config = config;
  }

  async getLibraryUrlTemplate(): Promise<string> {
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
        throw "Library registry is not available.";
      }
    }
    return this.libraryUrlTemplate;
  }

  getDataFromAuthDocumentAndCatalog(
    authDocument: AuthDocument,
    catalog: OPDSFeed
  ) {
    let data = {
      catalogName: authDocument["title"],
      colors: authDocument["web_color_scheme"],
      logoUrl: null,
      headerLinks: [],
      cssLinks: []
    };

    for (const link of authDocument.links) {
      if (link.rel === "logo") {
        data.logoUrl = link.href;
      } else if (link.rel === "stylesheet") {
        data.cssLinks.push(link);
      }
    }

    for (const link of catalog["links"]) {
      if (link.role === "navigation") {
        data.headerLinks.push(link);
      }
    }

    return data;
  }

  async getLibraryData(library: string): Promise<LibraryData> {
    const entry = await this.getCacheEntry(library);
    let catalogUrl;
    let catalogName;
    if (Object.keys(this.config || {}).length) {
      catalogUrl = this.config[library];
    } else {
      for (const link of entry.registryEntry.links) {
        if (link.rel === "http://opds-spec.org/catalog") {
          catalogUrl = link.href;
          break;
        }
      }
      catalogName = entry.registryEntry.metadata.title;
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
          throw "Registry entry does not have a catalog URL";
        }
      } else if (this.config) {
        catalogUrl = this.config[library];
        if (!catalogUrl) {
          throw "No catalog is configured for library " + library;
        }
      }

      let catalog = currentEntry && currentEntry.catalog;
      try {
        catalog = await this.getCatalog(catalogUrl);
      } catch (catalogError) {
        // If we can't get the catalog, patrons won't be able to use the application
        // anyway.
        console.warn(catalogError);
        throw "This library is not available.";
      }

      let authDocument = currentEntry && currentEntry.authDocument;
      try {
        authDocument = await this.getAuthDocument(catalog);
      } catch (authDocError) {
        // If we can't get the authentication document, keep the previous cached
        // version or proceed without one.
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

  async getRegistryEntry(library): Promise<void> {
    const template = await this.getLibraryUrlTemplate();
    const libraryUrl = template.replace("{uuid}", library);
    try {
      const registryResponse = await fetch(libraryUrl);
      const registryCatalog = await registryResponse.json();
      if (!registryCatalog.catalogs || registryCatalog.catalogs.length !== 1) {
        throw "Registry did not return a catalog for this library id: " +
          library;
      }
      const registryEntry = registryCatalog.catalogs[0];
      return registryEntry;
    } catch (error) {
      console.warn(error);
      throw "This library is not available.";
    }
  }

  async getCatalog(rootUrl: string): Promise<OPDSFeed> {
    let catalog: OPDSFeed;
    try {
      const catalogResponse = await fetch(rootUrl);
      const rawCatalog = await catalogResponse.text();
      const parser = new OPDSParser();
      const parsedCatalog = await parser.parse(rawCatalog);
      if (parsedCatalog instanceof OPDSFeed) {
        catalog = parsedCatalog;
      }
    } catch (error) {
      throw "Could not get OPDS catalog at " + rootUrl;
    }
    if (!catalog) {
      throw "Could not get OPDS catalog at " + rootUrl;
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
      throw "Could not find authentication document in OPDS catalog";
    }
    try {
      const authDocResponse = await fetch(authDocLink);
      const authDoc = await authDocResponse.json();
      return authDoc;
    } catch (error) {
      throw "Could not get authentication document at " + authDocLink;
    }
  }
}
