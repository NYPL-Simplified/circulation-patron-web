import * as React from "react";
import {
  AnyBook,
  BookMedium,
  BorrowableBook,
  FulfillableBook,
  OnHoldBook,
  ReservableBook,
  ReservedBook,
  UnsupportedBook
} from "interfaces";
import { Book, Headset } from "../icons";

export function getAuthors(book: AnyBook, lim?: number): string[] {
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

export function getAuthorsString(book: AnyBook): string {
  const { authors } = book;
  if (!authors) return "Unknown Author";
  const authorsArray = getAuthors(book, 2);

  if (authors.length > 2) {
    authorsArray.push(`& ${authors.length - 2} more`);
  }

  return authorsArray.join(", ");
}

export function availabilityString(book: AnyBook) {
  const status = book.status;

  switch (status) {
    case "borrowable":
    case "reservable":
      const availableCopies = book.copies?.available;
      const totalCopies = book.copies?.total;
      const queue =
        typeof book.holds?.total === "number" ? book.holds.total : null;

      return typeof availableCopies === "number" &&
        typeof totalCopies === "number"
        ? `${availableCopies} out of ${totalCopies} copies available.${
            queue ? ` ${queue} patrons in the queue.` : ""
          }`
        : null;

    case "reserved":
      const position = book.holds?.position;
      if (!position || isNaN(position)) return null;
      return `${position} patrons ahead of you in the queue.`;

    case "on-hold":
      const until = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";
      const untilStr = until === "NaN" ? undefined : until;

      return `You have this book on hold${
        untilStr ? ` until ${untilStr}` : ""
      }.`;

    case "fulfillable":
      const availableUntil = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";

      return availableUntil !== "NaN"
        ? `You have this book on loan until ${availableUntil}.`
        : null;

    case "unsupported":
      return null;
  }
}

export function queueString(book: AnyBook) {
  const holds = book.holds?.total;
  return typeof holds === "number"
    ? `There are ${holds} other patrons in the queue.`
    : "";
}

export function bookIsFulfillable(book: AnyBook): book is FulfillableBook {
  return book.status === "fulfillable";
}

export function bookIsUnsupported(book: AnyBook): book is UnsupportedBook {
  return book.status === "unsupported";
}

export function bookIsReserved(book: AnyBook): book is ReservedBook {
  return book.status === "reserved";
}

export function bookIsReservable(book: AnyBook): book is ReservableBook {
  return book.status === "reservable";
}

export function bookIsOnHold(book: AnyBook): book is OnHoldBook {
  return book.status === "on-hold";
}

export function bookIsBorrowable(book: AnyBook): book is BorrowableBook {
  return book.status === "borrowable";
}

export function bookIsAudiobook(book: AnyBook): boolean {
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

export function getMedium(book: AnyBook): BookMedium | "" {
  if (!book.raw || !book.raw["$"] || !book.raw["$"]["schema:additionalType"]) {
    return "";
  }

  return book.raw["$"]["schema:additionalType"].value
    ? book.raw["$"]["schema:additionalType"].value
    : "";
}
