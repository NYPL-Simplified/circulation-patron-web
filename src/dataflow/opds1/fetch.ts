import OPDSParser, { OPDSFeed, OPDSEntry } from "opds-feed-parser";
import ApplicationError from "errors";
import { CollectionData } from "interfaces";
import { feedToCollection } from "dataflow/opds1/parse";

const parser = new OPDSParser();
/**
 * Function that will fetch opds and parse it into either
 * a Feed or an Entry
 */
async function fetchOPDS(
  url: string,
  token?: string
): Promise<OPDSEntry | OPDSFeed> {
  const headers = prepareHeaders(token);
  const response = await fetch(url, {
    headers
  });
  const text = await response.text();
  // check for an error code in the status
  if (!response.ok) {
    throw new ApplicationError(
      `Error fetching OPDS Data. Url: ${url} Response text: ${text}`
    );
  }

  try {
    // parse the text into an opds feed or entry
    return await parser.parse(text);
  } catch (e) {
    throw new ApplicationError(
      "Could not parse fetch response into an OPDS Feed or Entry",
      e
    );
  }
}

/**
 * A function specifically for fetching a feed
 */
export async function fetchFeed(
  url: string,
  token?: string
): Promise<OPDSFeed> {
  const result = await fetchOPDS(url, token);
  if (result instanceof OPDSFeed) {
    return result;
  }
  throw new ApplicationError(
    `Network response was expected to be an OPDS 1.x Feed, but was not parseable as such. Url: ${url}`
  );
}

/**
 * A function specifically for fetching an entry
 */
export async function fetchEntry(
  url: string,
  token?: string
): Promise<OPDSEntry> {
  const result = await fetchOPDS(url, token);
  if (result instanceof OPDSEntry) {
    return result;
  }
  throw new ApplicationError(
    `Network response was expected to be an OPDS 1.x Entry, but was not parseable as such. Url: ${url}`
  );
}

/**
 * A function to fetch a feed and convert it to a collection
 */
export async function fetchCollection(
  url: string,
  token?: string
): Promise<CollectionData> {
  const feed = await fetchFeed(url, token);
  const collection = feedToCollection(feed, url);
  return collection;
}

/**
 * Utilities
 */

export function createCollectionUrl(
  catalogUrl: string,
  collectionUrl: string | undefined
): string {
  return `${collectionUrl ?? ""}`;
}

export function createBookUrl(catalogUrl: string, bookUrl: string) {
  return `${bookUrl}`;
}

export function stripUndefined(json: any) {
  return JSON.parse(JSON.stringify(json));
}

function prepareHeaders(token?: string) {
  const headers: {
    [key: string]: string;
  } = {
    "X-Requested-With": "XMLHttpRequest"
  };
  if (token) {
    headers["Authorization"] = token;
  }
  return headers;
}
