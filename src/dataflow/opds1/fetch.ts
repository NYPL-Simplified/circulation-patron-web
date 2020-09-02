import OPDSParser, { OPDSFeed, OPDSEntry } from "opds-feed-parser";
import ApplicationError from "errors";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { feedToCollection } from "dataflow/opds1/parse";
import { AuthCredentials } from "interfaces";

const parser = new OPDSParser();
/**
 * Function that will fetch opds and parse it into either
 * a Feed or an Entry
 */
async function fetchOPDS(
  url: string,
  credentials?: AuthCredentials
): Promise<OPDSEntry | OPDSFeed> {
  const headers = prepareHeaders(credentials);
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
  credentials?: AuthCredentials
): Promise<OPDSFeed> {
  const result = await fetchOPDS(url, credentials);
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
  credentials?: AuthCredentials
): Promise<OPDSEntry> {
  const result = await fetchOPDS(url, credentials);
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
  credentials?: AuthCredentials
): Promise<CollectionData> {
  const feed = await fetchFeed(url, credentials);
  const collection = feedToCollection(feed, url);
  return collection;
}

/**
 * Utilities
 */

export function createCollectionUrl(
  catalogUrl: string,
  collectionUrl: string
): string {
  return `${catalogUrl}/${collectionUrl}`;
}

export function stripUndefined(json: any) {
  return JSON.parse(JSON.stringify(json));
}

function prepareHeaders(credentials?: AuthCredentials) {
  const headers = {
    "X-Requested-With": "XMLHttpRequest"
  };
  if (credentials) {
    headers["Authorization"] = credentials.token;
  }
  return headers;
}
