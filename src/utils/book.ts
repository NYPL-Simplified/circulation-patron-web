import { BookData, FetchErrorData } from "opds-web-client/lib/interfaces";
import moment from "moment";
import {
  bookIsOpenAccess,
  bookIsReserved,
  bookIsBorrowed
} from "opds-web-client/lib/utils/book";

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

export const getAvailabilityString = (book: BookData): string => {
  if (bookIsOpenAccess(book)) {
    return "This open-access book is available to keep.";
  }

  if (bookIsBorrowed(book)) {
    const availableUntil = book?.availability?.until;
    if (availableUntil) {
      const timeLeft = moment(availableUntil).fromNow(true);
      return `You have this book on loan for ${timeLeft}`;
    }
    // you have borrowed the book but it is unknown until when
    return "You have this book on loan.";
  }

  const availableCopies = book?.copies?.available;
  const totalCopies = book?.copies?.total;
  const totalHolds = book?.holds?.total;
  const holdsPosition = book?.holds?.position;

  let availabilityString = "";
  // there is a number of copies available that is known
  if (typeof availableCopies === "number" && typeof totalCopies === "number") {
    // show how many available, even if all are taken
    availabilityString += `${availableCopies} of ${totalCopies} copies available.`;

    // there is a queue
    if (typeof totalHolds === "number" && availableCopies === 0) {
      availabilityString += ` ${totalHolds} patrons in queue.`;

      if (bookIsReserved(book) && typeof holdsPosition === "number") {
        availabilityString += ` Your hold position: ${holdsPosition}.`;
      }
    }

    return availabilityString;
  }
  // the number of available copies is unknown
  return "Availability unknown";
};

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
