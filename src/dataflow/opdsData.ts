import OPDSParser, { OPDSFeed, OPDSEntry } from "opds-feed-parser";
import ApplicationError from "errors";

const parser = new OPDSParser();
/**
 * Function that will fetch opds and parse it into either
 * a Feed or an Entry
 */
export async function fetchOPDS(url: string): Promise<OPDSFeed | OPDSEntry> {
  const response = await fetch(url);
  const text = await response.text();
  // check for an error code in the status
  if (!response.ok) {
    throw new ApplicationError(
      `Error fetching collection. Response text: ${text}`
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
