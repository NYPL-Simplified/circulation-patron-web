import { AnyBook } from "interfaces";
import { queueString, bookIsAudiobook } from "utils/book";
import { makeBorrowableBooks } from "../../test-utils/fixtures/book";
import { getAuthors } from "../book";

const bookFixture = makeBorrowableBooks(1)[0];

describe("get authors", () => {
  /**
   * returns all authors default
   * returns limited number of authors
   * returns contributors if no authors
   * returns "Authors unknown" when neither
   */
  const someAuthors = ["Peter sieger", "Jeff", "Alan turing", "Boris Johnson"];
  test("returns all authors default", () => {
    const book = {
      ...bookFixture,
      authors: someAuthors
    };
    expect(getAuthors(book)).toBe(someAuthors);
  });

  test("returns limited number of authors when requested", () => {
    const book = {
      ...bookFixture,
      authors: someAuthors
    };
    expect(getAuthors(book, 2)).toStrictEqual(["Peter sieger", "Jeff"]);
  });

  test("returns contributors if no authors", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: someAuthors
    };
    expect(getAuthors(book)).toStrictEqual(someAuthors);
  });

  test("returns 'Authors unknown' when neither authors nor contributors provided", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: []
    };
    expect(getAuthors(book)).toStrictEqual(["Authors unknown"]);
  });
});

describe("queue string formatter", () => {
  test("returns empty string with no holds data", () => {
    const book: AnyBook = {
      ...bookFixture,
      holds: null
    };
    expect(queueString(book)).toBe("");
  });
  test("returns formatted string when total holds provided", () => {
    const book: AnyBook = {
      ...bookFixture,
      holds: {
        total: 10
      }
    };
    expect(queueString(book)).toBe("There are 10 other patrons in the queue.");
  });
});

describe("book is audiobook", () => {
  test("correctly recognizes audiobook", () => {
    const book: AnyBook = {
      ...bookFixture,
      raw: {
        $: {
          "schema:additionalType": {
            value: "http://bib.schema.org/Audiobook"
          }
        }
      }
    };

    expect(bookIsAudiobook(book)).toBe(true);
  });
});
