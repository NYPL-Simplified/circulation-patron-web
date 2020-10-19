import { APP_CONFIG } from "config";
import { fetchBook } from "dataflow/opds1/fetch";
import ApplicationError from "errors";
import {
  FulfillableBook,
  FulfillmentLink,
  MediaSupportLevel,
  OPDS1
} from "interfaces";
import { bookIsAudiobook } from "utils/book";
import { AXISNOW_DECRYPT } from "utils/env";
import { typeMap } from "utils/file";

/**
 * Fulfilling a book requires a couple pieces of information:
 *  - The configured support type for that combination of indirectionType and contentType
 *  - What UX should be presented to the user
 *  - How to actually go about fulfilling that UX
 *
 * Both of these are determinded by a combination of the final content type
 * and any layers of indirection the media is wrapped in. This file is an
 * attempt to centralize the logic of dealing with different media types
 * and layers of indirection.
 *
 * This file is based on:
 * https://docs.google.com/document/d/1dli5mgTbVaURN_B2AtUmPhgpaFUVqOqrzsaoFvCXnkA/edit?pli=1#
 */

export type DownloadFulfillment = {
  type: "download";
  id: string;
  contentType: OPDS1.AnyBookMediaType;
  getUrl: GetUrlWithIndirection;
  buttonLabel: string;
};
export type ReadInternalFulfillment = {
  type: "read-online-internal";
  id: string;
  url: string;
  buttonLabel: string;
};
export type ReadExternalFulfillment = {
  type: "read-online-external";
  id: string;
  getUrl: GetUrlWithIndirection;
  buttonLabel: string;
};
export type UnsupportedFulfillment = {
  type: "unsupported";
};

export type SupportedFulfillment =
  | DownloadFulfillment
  | ReadExternalFulfillment
  | ReadInternalFulfillment;

export type AnyFullfillment = SupportedFulfillment | UnsupportedFulfillment;

export function getFulfillmentFromLink(link: FulfillmentLink): AnyFullfillment {
  const { contentType, indirectionType, supportLevel } = link;

  // don't show fulfillment option if it is unsupported or only allows
  // a redirect to the companion app.
  if (supportLevel === "unsupported" || supportLevel === "redirect") {
    return { type: "unsupported" };
  }

  // there is no support for books with "Libby" DRM
  if (contentType === OPDS1.OverdriveEbookMediaType) {
    return { type: "unsupported" };
  }
  switch (contentType) {
    case OPDS1.PdfMediaType:
    case OPDS1.Mobi8Mediatype:
    case OPDS1.MobiPocketMediaType:
    case OPDS1.EpubMediaType:
      const typeName = typeMap[contentType].name;
      const modifier = indirectionType === OPDS1.AdeptMediaType ? "Adobe " : "";
      return {
        id: link.url,
        getUrl: constructGetUrl(indirectionType, contentType, link.url),
        type: "download",
        buttonLabel: `Download ${modifier}${typeName}`,
        contentType
      };

    case OPDS1.ExternalReaderMediaType:
      return {
        id: link.url,
        type: "read-online-external",
        getUrl: constructGetUrl(indirectionType, contentType, link.url),
        buttonLabel: "Read Online"
      };

    case OPDS1.AxisNowWebpubMediaType:
      // you can only read these if you can decrypt them.
      if (!AXISNOW_DECRYPT) {
        return { type: "unsupported" };
      }
      return {
        type: "read-online-internal",
        id: link.url,
        // parse the url into the internal url we need to send the user to
        url: `/read/${encodeURIComponent(link.url)}`,
        buttonLabel: "Read Online"
      };
  }
  // TODO: track to bugsnag that we have found an unhandled media type
  return {
    type: "unsupported"
  };
}

export function getFulfillmentsFromBook(
  book: FulfillableBook
): SupportedFulfillment[] {
  // we don't support any audiobooks whatsoever right now
  if (bookIsAudiobook(book)) return [];
  const links = book.fulfillmentLinks;
  const dedupedLinks = dedupeLinks(links);
  const supported = dedupedLinks
    .map(getFulfillmentFromLink)
    .filter(isSupported);
  return supported;
}

function isSupported(
  fulfillment: AnyFullfillment
): fulfillment is SupportedFulfillment {
  return fulfillment.type !== "unsupported";
}

/**
 * Constructs a function to be used later to fetch the actual url of the book,
 * when a user clicks on the fulfillment button
 */
type GetUrlWithIndirection = (
  catalogUrl: string,
  token?: string
) => Promise<string>;
const constructGetUrl = (
  indirectionType: OPDS1.IndirectAcquisitionType | undefined,
  contentType: OPDS1.AnyBookMediaType,
  url: string
): GetUrlWithIndirection => async (catalogUrl: string, token: string) => {
  /**
   * If there is OPDS Entry Indirection, we fetch the actual link
   * from within an entry
   */
  if (indirectionType === OPDS1.OPDSEntryMediaType) {
    const book = (await fetchBook(url, catalogUrl, token)) as FulfillableBook;
    const resolvedUrl = book.fulfillmentLinks?.find(
      link => link.contentType === contentType
    )?.url;
    if (!resolvedUrl) {
      throw new ApplicationError(
        "Indirect OPDS Entry did not contain the correct acquisition link."
      );
    }
    return resolvedUrl;
  }
  // otherwise there is no indirection, just return the url.
  return url;
};

export function dedupeLinks(links: FulfillmentLink[]) {
  return links.reduce<FulfillmentLink[]>((uniqueArr, current) => {
    const isDup = uniqueArr.find(
      uniqueLink => uniqueLink.contentType === current.contentType
    );

    return isDup ? uniqueArr : [...uniqueArr, current];
  }, []);
}

export function getAppSupportLevel(
  contentType: OPDS1.AnyBookMediaType,
  indirectionType: OPDS1.IndirectAcquisitionType | undefined
): MediaSupportLevel | "unsupported" {
  const mediaSupport = APP_CONFIG.mediaSupport;

  // if there is indirection, we search through the dictionary nested inside the
  // indirectionType
  if (indirectionType) {
    const supportLevel = mediaSupport[indirectionType]?.[contentType];
    return supportLevel ?? "unsupported";
  }

  return mediaSupport[contentType] ?? "unsupported";
}

/**
 * Check if any of the links is redirect or redirect-and-show support level
 */
export function shouldRedirectToCompanionApp(links: FulfillmentLink[]) {
  return links.reduce((prev, link) => {
    if (prev) return true;
    const supportLevel = link.supportLevel;
    if (supportLevel === "redirect" || supportLevel === "redirect-and-show") {
      return true;
    }
    return false;
  }, false);
}
