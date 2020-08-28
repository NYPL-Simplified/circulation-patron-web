import {
  OPDS2,
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
import ApplicationError, { PageNotFoundError, AppSetupError } from "errors";
import { CatalogEntry } from "types/opds2";

/**
 * Fetches an OPDSFeed with a given catalogUrl. Parses it into an OPDSFeed and
 * returns it.
 */
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

/**
 * Returns a function to construct a registry catalog link, which leads to a
 * LibraryRegistryFeed containing a single CatalogEntry.
 */
async function fetchCatalogLinkBuilder(
  registryBase: string
): Promise<(uuid: string) => string> {
  try {
    const response = await fetch(registryBase);
    const registryCatalog = (await response.json()) as OPDS2.LibraryRegistryFeed;
    const templateUrl = registryCatalog?.links.find(
      link => link.rel === OPDS2.CatalogLinkTemplateRelation
    )?.href;
    if (!templateUrl) {
      throw new ApplicationError(
        `Template not present in response from: ${registryBase}`
      );
    }
    return uuid => templateUrl.replace("{uuid}", uuid);
  } catch (e) {
    throw new ApplicationError(
      `Could not fetch the library template at: ${registryBase}`,
      e
    );
  }
}

/**
 * Fetches a CatalogEntry from a library registry given an identifier
 * for the library.
 */
async function fetchCatalogEntry(
  librarySlug: string,
  registryBase: string
): Promise<CatalogEntry> {
  const linkBuilder = await fetchCatalogLinkBuilder(registryBase);
  const catalogFeedUrl = linkBuilder(librarySlug);
  try {
    const response = await fetch(catalogFeedUrl);
    const catalogFeed = (await response.json()) as OPDS2.LibraryRegistryFeed;
    const catalogEntry = catalogFeed?.catalogs?.[0];
    if (!catalogEntry)
      throw new ApplicationError(
        `LibraryRegistryFeed returned by ${catalogFeedUrl} does not contain a CatalogEntry.`
      );
    return catalogEntry;
  } catch (e) {
    throw new ApplicationError(
      `Could not fetch catalog entry for library: ${librarySlug} at ${registryBase}`,
      e
    );
  }
}

function findCatalogRootUrl(catalog: OPDS2.CatalogEntry) {
  return catalog.links.find(link => link.rel === OPDS2.CatalogRootRelation)
    ?.href;
}

/**
 * Interprets the env vars to return the catalog root url.
 */
export async function getCatalogRootUrl(librarySlug?: string): Promise<string> {
  if (CIRCULATION_MANAGER_BASE) {
    if (librarySlug) {
      throw new PageNotFoundError(
        "App is running with a single Circ Manager, but you're trying to access a multi-library route: " +
          librarySlug
      );
    }
    if (CONFIG_FILE || REGISTRY_BASE) {
      throw new AppSetupError(
        "App is set up with SIMPLIFIED_CATALOG_BASE and either CONFIG_FILE or REGISTRY. You should only have one defined."
      );
    }
    return CIRCULATION_MANAGER_BASE;
  }

  // otherwise we are running with multiple libraries.
  if (CONFIG_FILE || REGISTRY_BASE) {
    if (!librarySlug)
      throw new PageNotFoundError(
        "Library slug must be provided when running with multiple libraries."
      );

    if (CONFIG_FILE) {
      if (REGISTRY_BASE) {
        throw new AppSetupError(
          "You can only have one of SIMPLIFIED_CATALOG_BASE and REGISTRTY_BASE defined at one time."
        );
      }
      const configFile = await getConfigFile(CONFIG_FILE);
      const configEntry = configFile[librarySlug];
      if (configEntry) return configEntry;
      throw new PageNotFoundError(
        "No CONFIG_FILE entry for library: " + librarySlug
      );
    }

    if (REGISTRY_BASE) {
      const catalogEntry = await fetchCatalogEntry(librarySlug, REGISTRY_BASE);
      const catalogRootUrl = findCatalogRootUrl(catalogEntry);
      if (!catalogRootUrl)
        throw new ApplicationError(
          `CatalogEntry did not contain a Catalog Root Url. Library UUID: ${librarySlug}`
        );
      return catalogRootUrl;
    }
  }
  throw new AppSetupError(
    "Application must be run with one of SIMPLIFIED_CATALOG_BASE, CONFIG_FILE or REGISTRY_BASE."
  );
}

/**
 * Fetches an auth document from the supplied url and returns it
 * as a parsed AuthDocument
 */
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

/**
 * Constructs the internal LibraryData state from an auth document,
 * catalog url, and library slug.
 */
export function buildLibraryData(
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
    colors:
      authDoc.web_color_scheme?.primary && authDoc.web_color_scheme.secondary
        ? {
            primary: authDoc.web_color_scheme.primary,
            secondary: authDoc.web_color_scheme.secondary
          }
        : null,
    headerLinks,
    libraryLinks
  };
}

/**
 * Extracts the href of an auth document from the links in an OPDSFeed.
 */
export function getAuthDocHref(catalog: OPDSFeed) {
  const link = catalog.links.find(link => link.rel === AuthDocLinkRelation);
  if (!link)
    throw new ApplicationError(
      "OPDS Catalog did not contain an auth document link."
    );
  return link.href;
}

/**
 * Parses the links array in an auth document into an object of links.
 */
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

/**
 * Attempts to create an array of all the libraries available with the
 * current env settings.
 */
export async function getLibrarySlugs() {
  if (CIRCULATION_MANAGER_BASE) return [];

  if (CONFIG_FILE) {
    const configFile = await getConfigFile(CONFIG_FILE);
    const slugs = Object.keys(configFile);
    return slugs;
  }

  if (REGISTRY_BASE) {
    /**
     * We don't do any static generation when running with a
     * library registry. Therefore, we return an empty array
     */
    return [];
  }

  throw new ApplicationError("Unable to get library slugs for current setup.");
}
