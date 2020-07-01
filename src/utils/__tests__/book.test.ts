import { getFulfillmentState } from "utils/book";
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
  test("returns AVAILABLE_OPEN_ACCESS when open access links present and status is 'available'", () => {
    expect(getFulfillmentState(bookFixture)).toBe("AVAILABLE_OPEN_ACCESS");
  });
  test("does not return AVAILABLE_OPEN_ACCESS is status is not 'available'", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        availability: { status: "ready" }
      })
    ).toBe("READY_TO_BORROW");
  });
  test("returns AVAILABLE_TO_ACCESS when 'available' and no open access links present", () => {
    expect(
      getFulfillmentState({
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
      })
    ).toBe("AVAILABLE_TO_ACCESS");
  });

  test("does not count empty array for fulfillmentLinks", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        availability: { status: "available" },
        openAccessLinks: undefined,
        fulfillmentLinks: []
      })
    ).toBe("AVAILABLE_TO_BORROW");
  });

  test("does not count empty array for openAccessLinks", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        availability: { status: "available" },
        openAccessLinks: [],
        fulfillmentLinks: []
      })
    ).toBe("AVAILABLE_TO_BORROW");
  });

  test("returns AVAILABLE_TO_BORROW when no fulfillment or open access links and status is 'available'", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        openAccessLinks: undefined,
        fulfillmentLinks: undefined,
        availability: { status: "available" },
        borrowUrl: "/borrow"
      })
    ).toBe("AVAILABLE_TO_BORROW");
  });

  test("returns READY_TO_BORROW when status is 'ready'", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        openAccessLinks: undefined,
        fulfillmentLinks: undefined,
        availability: { status: "ready" },
        borrowUrl: "/borrow"
      })
    ).toBe("READY_TO_BORROW");
  });

  test("returns AVAILABLE_TO_RESERVE when status is 'unavailable'", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        openAccessLinks: undefined,
        fulfillmentLinks: undefined,
        availability: { status: "unavailable" },
        borrowUrl: "/borrow"
      })
    ).toBe("AVAILABLE_TO_RESERVE");
  });

  test("returns RESERVED when status is 'reserved'", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        openAccessLinks: undefined,
        fulfillmentLinks: undefined,
        availability: { status: "reserved" },
        borrowUrl: "/borrow"
      })
    ).toBe("RESERVED");
  });

  test("error state", () => {
    expect(
      getFulfillmentState({
        ...bookFixture,
        openAccessLinks: undefined,
        fulfillmentLinks: undefined,
        availability: { status: "" },
        borrowUrl: "/borrow"
      })
    ).toBe("FULFILLMENT_STATE_ERROR");
  });
});
