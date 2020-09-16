import { BookData } from "interfaces";
import { getFulfillmentState, queueString, bookIsAudiobook } from "utils/book";
import { book as bookFixture } from "../../test-utils/fixtures/book";
import { getAuthors } from "../book";

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

describe("getFulfillmentState", () => {
  test("returns AVAILABLE_OPEN_ACCESS when open access links present and status is 'available' and book is borrowed", () => {
    expect(getFulfillmentState(bookFixture, true)).toBe(
      "AVAILABLE_OPEN_ACCESS"
    );
  });
  test("returns AVAILABLE_TO_BORROW when open access links present and status is 'available' and book is not borrowed", () => {
    expect(getFulfillmentState(bookFixture, false)).toBe("AVAILABLE_TO_BORROW");
  });
  test("does not return AVAILABLE_OPEN_ACCESS is status is not 'available'", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          availability: { status: "ready" }
        },
        false
      )
    ).toBe("READY_TO_BORROW");
  });
  test("returns AVAILABLE_TO_ACCESS when 'available' and no open access links present", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          availability: { status: "available" },
          openAccessLinks: undefined,
          fulfillmentLinks: [
            {
              url: "/pdf-link",
              type: "application/pdf",
              indirectType: "indirect"
            }
          ]
        },
        true
      )
    ).toBe("AVAILABLE_TO_ACCESS");
  });

  test("does not count empty array for fulfillmentLinks", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          availability: { status: "available" },
          openAccessLinks: undefined,
          fulfillmentLinks: []
        },
        false
      )
    ).toBe("AVAILABLE_TO_BORROW");
  });

  test("does not count empty array for openAccessLinks", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          availability: { status: "available" },
          openAccessLinks: [],
          fulfillmentLinks: []
        },
        true
      )
    ).toBe("AVAILABLE_TO_BORROW");
  });

  test("returns AVAILABLE_TO_BORROW when no fulfillment or open access links and status is 'available'", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          openAccessLinks: undefined,
          fulfillmentLinks: undefined,
          availability: { status: "available" },
          borrowUrl: "/borrow"
        },
        false
      )
    ).toBe("AVAILABLE_TO_BORROW");
  });

  test("returns READY_TO_BORROW when status is 'ready'", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          openAccessLinks: undefined,
          fulfillmentLinks: undefined,
          availability: { status: "ready" },
          borrowUrl: "/borrow"
        },
        false
      )
    ).toBe("READY_TO_BORROW");
  });

  test("returns AVAILABLE_TO_RESERVE when status is 'unavailable'", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          openAccessLinks: undefined,
          fulfillmentLinks: undefined,
          availability: { status: "unavailable" },
          borrowUrl: "/borrow"
        },
        false
      )
    ).toBe("AVAILABLE_TO_RESERVE");
  });

  test("returns RESERVED when status is 'reserved'", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          openAccessLinks: undefined,
          fulfillmentLinks: undefined,
          availability: { status: "reserved" },
          borrowUrl: "/borrow"
        },
        false
      )
    ).toBe("RESERVED");
  });

  test("error state", () => {
    expect(
      getFulfillmentState(
        {
          ...bookFixture,
          openAccessLinks: undefined,
          fulfillmentLinks: undefined,
          availability: { status: "available" },
          borrowUrl: undefined
        },
        false
      )
    ).toBe("FULFILLMENT_STATE_ERROR");
  });
});

describe("queue string formatter", () => {
  test("returns empty string with no holds data", () => {
    const book: BookData = {
      ...bookFixture,
      holds: null
    };
    expect(queueString(book)).toBe("");
  });
  test("returns formatted string when total holds provided", () => {
    const book: BookData = {
      ...bookFixture,
      holds: {
        total: 10
      }
    };
    expect(queueString(book)).toBe("10 patrons in the queue.");
  });
});

describe("book is audiobook", () => {
  test("correctly recognizes audiobook", () => {
    const book: BookData = {
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
