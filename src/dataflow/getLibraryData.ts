/* eslint-disable camelcase */
import {
  LibraryData,
  LibraryLinks,
  AuthDocument,
  HTMLMediaType,
  AuthDocumentLink,
  AuthDocLinkRelation
} from "interfaces";
import OPDSParser, { OPDSFeed } from "opds-feed-parser";
import {
  CIRCULATION_MANAGER_BASE,
  REGISTRY_BASE,
  CONFIG_FILE
} from "utils/env";
import getConfigFile from "./getConfigFile";
import ApplicationError, {
  PageNotFoundError,
  UnimplementedError,
  AppSetupError
} from "errors";

export async function fetchCatalog(catalogUrl: string): Promise<OPDSFeed> {
  try {
    const catalogResponse = await fetch(catalogUrl);
    const rawCatalog = await catalogResponse.text();
    const parser = new OPDSParser();
    const parsedCatalog = await parser.parse(rawCatalog);
    return parsedCatalog as OPDSFeed;
  } catch (e) {
    throw new ApplicationError("Could not fetch catalog at: " + catalogUrl, e);
  }
}

async function fetchLibraryTemplate(registryBase: string) {
  try {
    const response = await fetch(registryBase);
    const registryCatalog = (await response.json()) as OPDSFeed;
    const templateUrl = registryCatalog?.links.find(
      link => link.rel === "http://librarysimplified.org/rel/registry/library"
    )?.href;
    if (!templateUrl) {
      throw new ApplicationError(
        `Template not present in response from: ${registryBase}`
      );
    }
    return templateUrl;
  } catch (e) {
    throw new ApplicationError(
      `Could not fetch the library template at: ${registryBase}`,
      e
    );
  }
}

async function fetchRegistryEntry(librarySlug: string, registryBase: string) {
  // get the template
  // fill in the template
  // fetch the registry
  // convert to json
  // check for catalogs
  // return the first catalog
  const template = await fetchLibraryTemplate(registryBase);
  const libraryUrl = template.replace("{uuid}", librarySlug);
  try {
    const response = await fetch(libraryUrl);
    const catalog = (await response.json()) as OPDSFeed;
    // const entry = catalog.catalogs
  } catch (e) {
    throw new ApplicationError(
      `Could not fetch registry entry for library: ${librarySlug} at ${registryBase}`,
      e
    );
  }
}

const CATALOG_ROOT_REL = "http://opds-spec.org/catalog";
function getCatalogRootUrlFromRegistryEntry(entry) {
  return entry.links.find(link => link.rel === CATALOG_ROOT_REL)?.href;
}

export async function getCatalogUrl(librarySlug?: string) {
  if (CIRCULATION_MANAGER_BASE) {
    if (librarySlug) {
      throw new PageNotFoundError(
        "App is running with a single Circ Manager, but you're trying to access a multi-library route: " +
          librarySlug
      );
    }
    return CIRCULATION_MANAGER_BASE;
  }

  if (!librarySlug)
    throw new PageNotFoundError(
      "Library slug must be provided when running with multiple libraries."
    );

  if (CONFIG_FILE) {
    const configFile = await getConfigFile(CONFIG_FILE);
    const configEntry = configFile[librarySlug];
    if (configEntry) return configEntry;
    throw new PageNotFoundError(
      "No CONFIG_FILE entry for library: " + librarySlug
    );
  }

  if (REGISTRY_BASE) {
    // fetch the registry entry
    const entry = fetchRegistryEntry(librarySlug, REGISTRY_BASE);
    // get the root url and return it
    throw new UnimplementedError("Registry Base not implemented");
  }
  throw new AppSetupError(
    "One of CONFIG_FILE, REGISTRY_BASE, or SIMPLIFIED_CATALOG_BASE must be defined."
  );
}

export async function fetchAuthDocument(url: string): Promise<AuthDocument> {
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  } catch (e) {
    throw new ApplicationError(
      "Could not fetch auth document at url: " + url,
      e
    );
  }
}

export function getLibraryData(
  authDoc: AuthDocument,
  catalogUrl: string,
  librarySlug: string | undefined
): LibraryData {
  const logoUrl = authDoc.links.find(link => link.rel === "logo")?.href;
  const headerLinks = authDoc.links.filter(link => link.rel === "navigation");
  const libraryLinks = parseLinks(authDoc.links);
  return {
    slug: librarySlug ?? null,
    catalogUrl,
    catalogName: authDoc.title,
    logoUrl: logoUrl ?? null,
    colors: {
      primary: authDoc?.web_color_scheme?.primary ?? null,
      secondary: authDoc?.web_color_scheme?.secondary ?? null
    },
    headerLinks,
    libraryLinks
  };
}

export function getAuthDocHref(catalog: OPDSFeed) {
  const link = catalog.links.find(link => link.rel === AuthDocLinkRelation);
  if (!link)
    throw new ApplicationError(
      "OPDS Catalog did not contain an auth document link."
    );
  return link.href;
}

function parseLinks(links: AuthDocumentLink[]): LibraryLinks {
  const parsed = links.reduce((links, link) => {
    switch (link.rel) {
      case "about":
        return { ...links, about: link };
      case "alternate":
        return { ...links, libraryWebsite: link };
      case "privacy-policy":
        return { ...links, privacyPolicy: link };
      case "terms-of-service":
        return { ...links, tos: link };
      case "help":
        if (link.type === HTMLMediaType) return { ...links, helpWebsite: link };
        return { ...links, helpEmail: link };
      case "register":
      case "logo":
      case "navigation":
        return links;
      default:
        return links;
    }
  }, {});
  return parsed;
}

export async function getLibrarySlugs() {
  if (CIRCULATION_MANAGER_BASE) return [];

  if (CONFIG_FILE) {
    const configFile = await getConfigFile(CONFIG_FILE);
    const slugs = Object.keys(configFile);
    return slugs;
  }

  if (REGISTRY_BASE) {
    throw new UnimplementedError("REGISTRY BASE NOT IMPLEMENTED.");
  }

  throw new ApplicationError("Unable to get library slugs for current setup.");
}
