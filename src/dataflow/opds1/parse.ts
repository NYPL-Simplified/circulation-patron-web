/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  OPDSFeed,
  OPDSEntry,
  OPDSArtworkLink,
  AcquisitionFeed,
  OPDSCollectionLink,
  OPDSFacetLink,
  OPDSLink,
  SearchLink,
  CompleteEntryLink,
  OPDSCatalogRootLink,
  OPDSAcquisitionLink,
  OPDSShelfLink,
  OPDSIndirectAcquisition
} from "opds-feed-parser";
import {
  CollectionData,
  LaneData,
  Book,
  LinkData,
  FacetGroupData,
  BookAvailability,
  OPDS1,
  FulfillmentLink,
  AnyBook
} from "interfaces";
import { IncorrectAdeptMediaType } from "types/opds1";
import { getAppSupportLevel } from "utils/fulfill";
import { TrackOpenBookRel } from "types/opds1";

/**
 * Parses OPDS 1.x Feed or Entry into a Collection or Book
 */

/**
 * Type guards. Used for filtering links or narrowing the
 * type of a value to something more specific.
 */
function isFacetLink(link: OPDSLink): link is OPDSFacetLink {
  return link instanceof OPDSFacetLink;
}
function isCatalogRootLink(link: OPDSLink): link is OPDSCatalogRootLink {
  return link instanceof OPDSCatalogRootLink;
}
function isAcquisitionLink(link: OPDSLink): link is OPDSAcquisitionLink {
  return link instanceof OPDSAcquisitionLink;
}
function isArtworkLink(link: OPDSLink): link is OPDSArtworkLink {
  return link instanceof OPDSArtworkLink;
}
function isCollectionLink(link: OPDSLink): link is OPDSCollectionLink {
  return link instanceof OPDSCollectionLink;
}
function isSearchLink(link: OPDSLink): link is SearchLink {
  return link instanceof SearchLink;
}
function isDefined<T>(value: T | undefined): value is T {
  return typeof value !== "undefined";
}
function isRelatedLink(link: OPDSLink) {
  return link.rel === "related";
}
function isTrackOpenBookLink(link: OPDSLink) {
  return link.rel === TrackOpenBookRel;
}

/**
 * Utils
 */
const resolve = (base: string, relative: string) =>
  new URL(relative, base).toString();

/**
 * There is or was an error in the CM where it sent us incorrectly formatted
 * Adobe media types.
 */
export function fixMimeType(
  mimeType: OPDS1.IndirectAcquisitionType | typeof OPDS1.IncorrectAdeptMediaType
): OPDS1.IndirectAcquisitionType {
  return mimeType === IncorrectAdeptMediaType ? OPDS1.AdeptMediaType : mimeType;
}

function parseFormat(format: OPDSAcquisitionLink | OPDSIndirectAcquisition) {
  // if the format has an indirect type nested inside, that is the
  // content type of the format
  const indirectType = format.indirectAcquisitions?.[0]?.type;
  const contentType = (indirectType ?? format.type) as OPDS1.AnyBookMediaType;
  const indirectionType = indirectType
    ? (format.type as OPDS1.IndirectAcquisitionType)
    : undefined;
  return {
    contentType,
    indirectionType
  };
}

function getFormatSupportLevel(
  format: OPDSAcquisitionLink | OPDSIndirectAcquisition
) {
  const { contentType, indirectionType } = parseFormat(format);
  return getAppSupportLevel(contentType, indirectionType);
}

function buildFulfillmentLink(feedUrl: string) {
  return (link: OPDSAcquisitionLink): FulfillmentLink => {
    const { contentType, indirectionType } = parseFormat(link);
    const supportLevel = getAppSupportLevel(contentType, indirectionType);
    return {
      supportLevel,
      url: resolve(feedUrl, link.href),
      contentType: contentType as OPDS1.AnyBookMediaType,
      indirectionType: fixMimeType(
        indirectionType as
          | OPDS1.IndirectAcquisitionType
          | typeof OPDS1.IncorrectAdeptMediaType
      )
    };
  };
}

/**
 * HTML Sanitizer
 */
let sanitizeHtml: any;
const createDOMPurify = require("dompurify");
if (typeof window === "undefined") {
  // sanitization needs to work server-side,
  // so we use jsdom to build it a window object
  const { JSDOM } = require("jsdom");
  const jsdom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
    FetchExternalResources: false,
    ProcessExternalResources: false
  });
  const { window } = jsdom;
  const { defaultView } = window;

  sanitizeHtml = createDOMPurify(defaultView).sanitize;
} else {
  sanitizeHtml = createDOMPurify(window).sanitize;
}

/**
 * Converters
 */

export function entryToBook(entry: OPDSEntry, feedUrl: string): AnyBook {
  const authors = entry.authors.map(author => {
    return author.name;
  });

  const contributors = entry.contributors.map(contributor => {
    return contributor.name;
  });

  let imageUrl, imageThumbLink;
  const artworkLinks = entry.links.filter(isArtworkLink);
  if (artworkLinks.length > 0) {
    imageThumbLink = artworkLinks.find(
      link => link.rel === "http://opds-spec.org/image/thumbnail"
    );
    if (imageThumbLink) {
      imageUrl = resolve(feedUrl, imageThumbLink.href);
    } else {
      console.log(
        `WARNING: missing tumbnail image for ${entry.title}. Defaulting to use full image`
      );
      imageUrl = resolve(feedUrl, artworkLinks[0].href);
    }
  }

  const detailLink = entry.links.find(
    link => link instanceof CompleteEntryLink
  );
  const detailUrl = resolve(feedUrl, detailLink!.href);

  const categories = entry.categories
    .filter(category => !!category.label)
    .map(category => category.label);

  const acquisitionLinks = entry.links.filter(isAcquisitionLink);

  const borrowLink = getBorrowLink(acquisitionLinks);
  const { availability, holds, copies } = borrowLink ?? {};

  const openAccessLinks: FulfillmentLink[] = acquisitionLinks
    .filter(link => {
      return link.rel === OPDSAcquisitionLink.OPEN_ACCESS_REL;
    })
    .map(link => {
      const supportLevel = getFormatSupportLevel(link);
      return {
        url: resolve(feedUrl, link.href),
        contentType: link.type as OPDS1.AnyBookMediaType,
        supportLevel
      };
    });

  const relatedLinks = entry.links.filter(isRelatedLink);
  const relatedLink = relatedLinks.length > 0 ? relatedLinks[0] : null;

  const fulfillmentLinks = acquisitionLinks
    .filter(link => {
      return link.rel === OPDSAcquisitionLink.GENERIC_REL;
    })
    .map(buildFulfillmentLink(feedUrl))
    .filter(isDefined);

  const supportedFulfillmentLinks = fulfillmentLinks.filter(
    link => link.supportLevel !== "unsupported"
  );

  const revokeUrl =
    entry.links.find(link => link.rel === OPDS1.RevokeLinkRel)?.href ?? null;

  const trackOpenBookLink = entry.links.find(isTrackOpenBookLink);

  const book: Book = {
    id: entry.id,
    title: entry.title,
    series: entry.series,
    authors: authors,
    contributors: contributors,
    subtitle: entry.subtitle,
    summary: entry.summary.content && sanitizeHtml?.(entry.summary.content),
    imageUrl: imageUrl,
    availability: {
      ...availability,
      // we type cast status because our internal types
      // are stricter than those in OPDSFeedParser.
      status: availability?.status as BookAvailability
    },
    holds: holds,
    copies: copies,
    publisher: entry.publisher,
    published: entry.issued && formatDate(entry.issued),
    categories: categories,
    language: entry.language,
    url: detailUrl,
    relatedUrl: relatedLink?.href ?? null,
    trackOpenBookUrl: trackOpenBookLink?.href ?? null,
    raw: entry.unparsed
  };

  // It's fulfillable
  if (
    supportedFulfillmentLinks.length > 0 ||
    (!borrowLink && openAccessLinks.length > 0)
  ) {
    // include open access links in the fulfillment links
    const allFulfillmentLinks = [
      ...supportedFulfillmentLinks,
      ...openAccessLinks
    ];
    return {
      ...book,
      status: "fulfillable",
      fulfillmentLinks: allFulfillmentLinks,
      revokeUrl
    };
  }
  // it's a reserved book
  if (availability?.status === "reserved") {
    return {
      ...book,
      status: "reserved",
      revokeUrl
    };
  }
  // it's a reservable book
  if (borrowLink && borrowLink.availability.status === "unavailable") {
    return {
      ...book,
      status: "reservable",
      reserveUrl: borrowLink.href
    };
  }

  // it is on hold and ready to borrow
  if (borrowLink && borrowLink.availability.status === "ready") {
    return {
      ...book,
      status: "on-hold",
      borrowUrl: borrowLink.href
    };
  }

  // it's a borrowable book
  if (borrowLink && borrowLink.availability.status === "available") {
    return {
      ...book,
      status: "borrowable",
      borrowUrl: borrowLink.href
    };
  }

  // it is unsupported
  return {
    status: "unsupported",
    ...book
  };
}

/**
 * Extracts the url of the first borrow link that has a supported
 * format according to the APP_CONFIG.
 * In the future we hope to support many borrow links, but
 * this works for now.
 */
function getBorrowLink(
  links: OPDSAcquisitionLink[]
): OPDSAcquisitionLink | null {
  const supportedLink = links.find(link => {
    if (link.rel !== OPDSAcquisitionLink.BORROW_REL) return false;
    const indirects = link.indirectAcquisitions ?? [];
    const supportedFormat = indirects.find(
      format => getFormatSupportLevel(format) !== "unsupported"
    );
    if (supportedFormat) return true;
    return false;
  });
  return supportedLink ?? null;
}

function entryToLink(entry: OPDSEntry, feedUrl: string): LinkData | null {
  const links = entry.links;
  if (links.length > 0) {
    const href = resolve(feedUrl, links[0].href);
    return {
      id: entry.id,
      text: entry.title,
      url: href
    };
  }
  console.error(
    "Attempting to create Link with undefined url. entry is: ",
    entry
  );
  return null;
}

function dedupeBooks(books: AnyBook[]): AnyBook[] {
  // using Map because it preserves key order
  const bookIndex = books.reduce((index, book) => {
    index.set(book.id, book);
    return index;
  }, new Map<any, AnyBook>());

  return Array.from(bookIndex.values());
}

function formatDate(inputDate: string): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const date = new Date(inputDate);
  const day = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const month = monthNames[monthIndex];
  const year = date.getUTCFullYear();

  return `${month} ${day}, ${year}`;
}

function OPDSLinkToLinkData(
  feedUrl: string,
  link: OPDSLink | null = null
): LinkData | null {
  if (!link || !link.href) {
    return null;
  }

  return {
    url: resolve(feedUrl, link.href),
    text: link.title,
    type: link.rel
  };
}

export function feedToCollection(
  feed: OPDSFeed,
  feedUrl: string
): CollectionData {
  const collection = {
    id: feed.id,
    title: feed.title,
    url: feedUrl,
    raw: feed.unparsed
  };
  const books: AnyBook[] = [];
  const navigationLinks: LinkData[] = [];
  let lanes: LaneData[] = [];
  const laneTitles: any[] = [];
  const laneIndex: {
    title: any;
    url: string;
    books: AnyBook[];
  }[] = [];
  let facetGroups: FacetGroupData[] = [];
  let nextPageUrl: string | undefined = undefined;
  let catalogRootLink: OPDSLink | undefined = undefined;
  let parentLink: OPDSLink | undefined = undefined;
  let shelfUrl: string | undefined = undefined;
  let links: OPDSLink[] = [];

  feed.entries.forEach(entry => {
    if (feed instanceof AcquisitionFeed) {
      const book = entryToBook(entry, feedUrl);
      const collectionLink = entry.links.find(isCollectionLink);
      if (collectionLink) {
        const { title, href } = collectionLink;

        if (laneIndex[title as any]) {
          laneIndex[title as any].books.push(book);
        } else {
          laneIndex[title as any] = {
            title,
            url: resolve(feedUrl, href),
            books: [book]
          };
          // use array of titles to preserve lane order
          laneTitles.push(title);
        }
      } else {
        books.push(book);
      }
    } else {
      const link = entryToLink(entry, feedUrl);
      if (link) navigationLinks.push(link);
    }
  });

  lanes = laneTitles.reduce((result, title) => {
    const lane = laneIndex[title];
    lane.books = dedupeBooks(lane.books);
    result.push(lane);
    return result;
  }, lanes);
  let facetLinks: OPDSFacetLink[] = [];

  if (feed.links) {
    facetLinks = feed.links.filter(isFacetLink);

    const nextPageLink = feed.links.find(link => {
      return link.rel === "next";
    });
    if (nextPageLink) {
      nextPageUrl = resolve(feedUrl, nextPageLink.href);
    }

    catalogRootLink = feed.links.find(isCatalogRootLink);

    parentLink = feed.links.find(link => link.rel === "up");

    const shelfLink = feed.links.find(link => link instanceof OPDSShelfLink);
    if (shelfLink) {
      shelfUrl = shelfLink.href;
    }

    links = feed.links;
  }

  facetGroups = facetLinks.reduce<FacetGroupData[]>((result, link) => {
    const groupLabel = link.facetGroup;
    const label = link.title;
    const href = resolve(feedUrl, link.href);
    const active = link.activeFacet;
    const facet = { label, href, active };
    const newResult: FacetGroupData[] = [];
    let foundGroup = false;
    result.forEach(group => {
      if (group.label === groupLabel) {
        const facets = group.facets.concat(facet);
        newResult.push({ label: groupLabel, facets });
        foundGroup = true;
      } else {
        newResult.push(group);
      }
    });
    if (!foundGroup) {
      const facets = [facet];
      newResult.push({ label: groupLabel, facets });
    }
    return newResult;
  }, []);

  function notNull<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  }
  const filteredLinks = links
    .map(link => OPDSLinkToLinkData(feedUrl, link))
    // we have to filter out the null values in order for typescript to accept this
    .filter(notNull);

  return {
    ...collection,
    lanes,
    books,
    navigationLinks,
    facetGroups,
    nextPageUrl,
    catalogRootLink: OPDSLinkToLinkData(feedUrl, catalogRootLink),
    parentLink: OPDSLinkToLinkData(feedUrl, parentLink),
    shelfUrl,
    links: filteredLinks
  };
}

export function findSearchLink(feed: OPDSFeed) {
  return feed.links.find(isSearchLink);
}
