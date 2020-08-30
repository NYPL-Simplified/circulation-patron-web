import OPDSParser, { OPDSFeed, OPDSEntry } from "opds-feed-parser";
import ApplicationError from "errors";

const parser = new OPDSParser();
/**
 * Function that will fetch opds and parse it into either
 * a Feed or an Entry
 */
async function fetchOPDS(url: string): Promise<OPDSEntry | OPDSFeed> {
  const response = await fetch(url);
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
export async function fetchFeed(url: string): Promise<OPDSFeed> {
  const result = await fetchOPDS(url);
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
export async function fetchEntry(url: string): Promise<OPDSEntry> {
  const result = await fetchOPDS(url);
  if (result instanceof OPDSEntry) {
    return result;
  }
  throw new ApplicationError(
    `Network response was expected to be an OPDS 1.x Entry, but was not parseable as such. Url: ${url}`
  );
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
