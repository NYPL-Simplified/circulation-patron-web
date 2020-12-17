import { LibraryData, LibraryLinks, OPDS1 } from "interfaces";
import ApplicationError, { PageNotFoundError, ServerError } from "errors";
import { flattenSamlMethod } from "utils/auth";
import { APP_CONFIG } from "utils/env";

/**
 * Interprets the app config to return the auth document url.
 */
export async function getAuthDocUrl(librarySlug: string): Promise<string> {
  const libraries = APP_CONFIG.libraries;

  const authDocUrl =
    librarySlug in libraries ? libraries[librarySlug]?.authDocUrl : undefined;
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
