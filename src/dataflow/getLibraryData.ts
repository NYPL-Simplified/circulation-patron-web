import { OPDS2, LibraryData, LibraryLinks, OPDS1 } from "interfaces";
import ApplicationError, { PageNotFoundError, ServerError } from "errors";
import { flattenSamlMethod } from "utils/auth";
import { APP_CONFIG } from "utils/env";

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
      throw new ApplicationError({
        detail: `Template not present in response from: ${registryBase}`
      });
    }
    return uuid => templateUrl.replace("{uuid}", uuid);
  } catch (e) {
    throw new ApplicationError(
      { detail: `Could not fetch the library template at: ${registryBase}` },
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
      throw new ApplicationError({
        detail: `LibraryRegistryFeed returned by ${catalogFeedUrl} does not contain a CatalogEntry.`
      });
    return catalogEntry;
  } catch (e) {
    if (e instanceof ApplicationError) throw e;
    throw new ApplicationError(
      {
        detail: `Could not fetch catalog entry for library: ${librarySlug} at ${registryBase}`
      },
      e
    );
  }
}

function findAuthDocUrl(catalog: OPDS2.CatalogEntry) {
  return catalog.links.find(link => link.rel === OPDS2.AuthDocumentRelation)
    ?.href;
}

/**
 * Interprets the app config to return the auth document url.
 */
export async function getAuthDocUrl(librarySlug: string): Promise<string> {
  const libraries = APP_CONFIG.libraries;

  // we have a library registry url
  if (typeof libraries === "string") {
    const catalogEntry = await fetchCatalogEntry(librarySlug, libraries);
    const authDocUrl = findAuthDocUrl(catalogEntry);
    if (!authDocUrl)
      throw new ApplicationError({
        detail: `CatalogEntry did not contain a Authentication Document Url. Library UUID: ${librarySlug}`
      });
    return authDocUrl;
  }
  // we have a dictionary of libraries
  // just get the url from the dictionary

  const authDocUrl =
    librarySlug in libraries ? libraries[librarySlug] : undefined;
  if (typeof authDocUrl !== "string") {
    throw new PageNotFoundError(
      `No authentication document url is configured for the library: ${librarySlug}.`
    );
  }
  return authDocUrl;
}

/**
 * Fetches an auth document from the supplied url and returns it
 * as a parsed AuthDocument
 */
export async function fetchAuthDocument(
  url: string
): Promise<OPDS1.AuthDocument> {
  const response = await fetch(url);
  if (!response.ok) {
    const details = await response.json();
    throw new ServerError(url, response.status, details);
  }
  const json = await response.json();
  return json;
}

/**
 * Extracts the loans url from an auth document
 */
function getShelfUrl(authDoc: OPDS1.AuthDocument): string | null {
  return (
    authDoc.links?.find(link => {
      return link.rel === OPDS1.ShelfLinkRel;
    })?.href ?? null
  );
}

/**
 * Extracts the catalot root url from an auth document
 */
function getCatalogUrl(authDoc: OPDS1.AuthDocument): string {
  const url =
    authDoc.links?.find(link => {
      return link.rel === OPDS1.CatalogRootRel;
    })?.href ?? null;

  if (!url)
    throw new ApplicationError({
      detail: "No Catalog Root Url present in Auth Document."
    });

  return url;
}
/**
 * Constructs the internal LibraryData state from an auth document,
 * catalog url, and library slug.
 */
export function buildLibraryData(
  authDoc: OPDS1.AuthDocument,
  librarySlug: string
): LibraryData {
  const logoUrl = authDoc.links?.find(link => link.rel === "logo")?.href;
  const headerLinks =
    authDoc.links?.filter(link => link.rel === "navigation") ?? [];
  const libraryLinks = parseLinks(authDoc.links);
  const authMethods = flattenSamlMethod(authDoc);
  const shelfUrl = getShelfUrl(authDoc);
  const catalogUrl = getCatalogUrl(authDoc);
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
    authMethods
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
