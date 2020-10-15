import {
  OPDS2,
  LibraryData,
  LibraryLinks,
  OPDS1,
  SearchData
} from "interfaces";
import OPDSParser, { OPDSFeed, OPDSShelfLink } from "opds-feed-parser";
import ApplicationError, { PageNotFoundError } from "errors";
import { flattenSamlMethod } from "utils/auth";
import { APP_CONFIG } from "config";

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
): Promise<OPDS2.CatalogEntry> {
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
 * Interprets the app config to return the catalog root url.
 */
export async function getCatalogRootUrl(librarySlug: string): Promise<string> {
  const libraries = APP_CONFIG.libraries;

  // we have a library registry url
  if (typeof libraries === "string") {
    const catalogEntry = await fetchCatalogEntry(librarySlug, libraries);
    const catalogRootUrl = findCatalogRootUrl(catalogEntry);
    if (!catalogRootUrl)
      throw new ApplicationError(
        `CatalogEntry did not contain a Catalog Root Url. Library UUID: ${librarySlug}`
      );
    return catalogRootUrl;
  }
  // we have a dictionary of libraries
  // just get the url from the dictionary

  const catalogRootUrl =
    librarySlug in libraries ? libraries[librarySlug] : undefined;
  if (typeof catalogRootUrl !== "string") {
    throw new PageNotFoundError(
      `No catalog root url is configured for the library: ${librarySlug}.`
    );
  }
  return catalogRootUrl;
}

/**
 * Fetches an auth document from the supplied url and returns it
 * as a parsed AuthDocument
 */
export async function fetchAuthDocument(
  url: string
): Promise<OPDS1.AuthDocument> {
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
 * Extracts the loans url from a catalog root
 */
function getShelfUrl(catalog: OPDSFeed): string | null {
  return (
    catalog.links.find(link => {
      return link instanceof OPDSShelfLink;
    })?.href ?? null
  );
}

/**
 * Constructs the internal LibraryData state from an auth document,
 * catalog url, and library slug.
 */
export function buildLibraryData(
  authDoc: OPDS1.AuthDocument,
  catalogUrl: string,
  librarySlug: string,
  catalog: OPDSFeed,
  searchData?: SearchData
): LibraryData {
  const logoUrl = authDoc.links?.find(link => link.rel === "logo")?.href;
  const headerLinks =
    authDoc.links?.filter(link => link.rel === "navigation") ?? [];
  const libraryLinks = parseLinks(authDoc.links);
  const authMethods = flattenSamlMethod(authDoc);
  const shelfUrl = getShelfUrl(catalog);
  return {
    slug: librarySlug,
    catalogUrl,
    shelfUrl: shelfUrl ?? null,
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
    libraryLinks,
    authMethods,
    searchData: searchData ?? null
  };
}

/**
 * Parses the links array in an auth document into an object of links.
 */
function parseLinks(links: OPDS1.AuthDocumentLink[] | undefined): LibraryLinks {
  if (!links) return {};
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
        if (link.type === OPDS1.HTMLMediaType)
          return { ...links, helpWebsite: link };
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
export function getLibrarySlugs() {
  const libraries = APP_CONFIG.libraries;
  if (typeof libraries === "string") {
    console.warn(
      "Cannot retrive library slugs for a Library Registry based setup."
    );
    return null;
  }
  const slugs = Object.keys(libraries);
  return slugs;
}
