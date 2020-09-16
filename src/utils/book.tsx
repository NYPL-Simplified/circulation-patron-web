import * as React from "react";
import { BookData, FetchErrorData, BookMedium, MediaLink } from "interfaces";
import { BookFulfillmentState } from "interfaces";

import { Book, Headset } from "../icons";
import { getMedium } from "owc/utils/book";

export function getAuthors(book: BookData, lim?: number): string[] {
  // select contributors if the authors array is undefined or empty.
  const allAuth =
    typeof book.authors?.length === "number" && book.authors.length > 0
      ? book.authors
      : typeof book.contributors?.length === "number" &&
        book.contributors.length > 0
      ? book.contributors
      : ["Authors unknown"];

  // now limit it to however many
  if (lim) {
    return allAuth.slice(0, lim);
  }
  return allAuth;
}

export function availabilityString(book: BookData) {
  if (book.openAccessLinks && book.openAccessLinks.length > 0)
    return "This open-access book is available to keep forever.";

  const availableCopies = book.copies?.available;
  const totalCopies = book.copies?.total;
  return typeof availableCopies === "number" && typeof totalCopies === "number"
    ? `${availableCopies} out of ${totalCopies} copies available.`
    : "Number of books available is unknown.";
}

export function queueString(book: BookData) {
  const holds = book.holds?.total;
  return typeof holds === "number" ? `${holds} patrons in the queue.` : "";
}

export function dedupeLinks<T extends MediaLink>(links: T[]) {
  return links.reduce<T[]>((uniqueArr, current) => {
    const isDup = uniqueArr.find(
      uniqueLink => uniqueLink.type === current.type
    );

    return isDup ? uniqueArr : [...uniqueArr, current];
  }, []);
}

function hasBorrowRelation(book: BookData) {
  return typeof book.borrowUrl === "string";
}

/**
 * the default assumption is that a book is available. See:
 * https://github.com/NYPL-Simplified/Simplified/wiki/OPDS-For-Library-Patrons#opdsavailability---describing-resource-availability
 */
const DEFAULT_AVAILABILITY = "available";

/**
 * This is mapped from a conversation with Leonard and the OPDS wiki:
 * https://github.com/NYPL-Simplified/Simplified/wiki/OPDS-For-Library-Patrons#opdsavailability---describing-resource-availability
 */
export function getFulfillmentState(
  book: BookData,
  isBorrowed: boolean
): BookFulfillmentState {
  const availabilityStatus = book.availability?.status ?? DEFAULT_AVAILABILITY;

  // indicates the book is open access and ready to download.
  // we prefer open access links to fulfillment links, if available.
  // we can't show OA links unless book is borrowed, however.
  if (
    isBorrowed &&
    availabilityStatus === "available" &&
    book.openAccessLinks &&
    book.openAccessLinks.length > 0
  )
    return "AVAILABLE_OPEN_ACCESS";

  if (
    availabilityStatus === "available" &&
    book.fulfillmentLinks &&
    book.fulfillmentLinks.length > 0
  )
    return "AVAILABLE_TO_ACCESS";

  if (availabilityStatus === "available" && hasBorrowRelation(book))
    return "AVAILABLE_TO_BORROW";

  if (availabilityStatus === "ready" && hasBorrowRelation(book))
    return "READY_TO_BORROW";

  if (availabilityStatus === "unavailable" && hasBorrowRelation(book))
    return "AVAILABLE_TO_RESERVE";

  if (availabilityStatus === "reserved") return "RESERVED";

  return "FULFILLMENT_STATE_ERROR";
}

export function getErrorMsg(error: FetchErrorData | null): string | null {
  const response = error?.response;
  if (response) {
    try {
      const responseObj = JSON.parse(response);
      // try to get the debug_message but otherwise just return
      // the full response as a string.
      // eslint-disable-next-line camelcase
      return responseObj?.debug_message ?? response;
    } catch {
      // it's not valid json. Just return it.
      return response;
    }
  }
  return null;
}

export function bookIsAudiobook(book: BookData): boolean {
  if (getMedium(book) === "http://bib.schema.org/Audiobook") {
    return true;
  }
  return false;
}

export const bookMediumMap: {
  [key in BookMedium]: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  };
} = {
  "http://bib.schema.org/Audiobook": {
    name: "Audiobook",
    icon: Headset
  },
  "http://schema.org/EBook": { name: "eBook", icon: Book },
  "http://schema.org/Book": { name: "Book", icon: Book }
};
