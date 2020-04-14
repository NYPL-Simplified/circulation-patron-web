import * as React from "react";
import { render, fixtures, actions, within, wait } from "../../../test-utils";
import merge from "deepmerge";
import FulfillmentCard from "../FulfillmentCard";
import {
  BookData,
  MediaType,
  FetchErrorData
} from "opds-web-client/lib/interfaces";
import userEvent from "@testing-library/user-event";
import { State } from "opds-web-client/lib/state";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import moment from "moment";

jest.mock("moment", () => () => ({
  fromNow: () => "two days"
}));

const makeBook = (data: Partial<BookData>) =>
  merge<BookData>(fixtures.book, data, {
    arrayMerge: (_a, b) => b
  });

describe("open-access book", () => {
  test("correct availability string", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      node.getByText("This open-access book is available to keep.")
    ).toBeInTheDocument();
  });
  test("shows download button", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />);
    const downloadButton = node.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("target", "__blank");
    expect(downloadButton).toHaveAttribute("href", "/epub-open-access-link");
  });
  test("allows selecting types", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />);
    const typeSelector = node.getByLabelText("TYPE");

    expect(typeSelector).toHaveValue("application/epub+zip");
    expect(within(typeSelector).getByText("PDF")).toBeInTheDocument();
    expect(within(typeSelector).getByText("EPUB")).toBeInTheDocument();
  });
  test("doesn't show duplicate options", () => {
    const bookWithDuplicateFormat = makeBook({
      openAccessLinks: [
        ...fixtures.book.openAccessLinks,
        {
          type: "application/pdf",
          url: "/pdf-open-access-link-2"
        }
      ]
    });
    const node = render(<FulfillmentCard book={bookWithDuplicateFormat} />);
    const typeSelector = node.getByLabelText("TYPE");
    expect(typeSelector).toHaveValue("application/epub+zip");
    expect(within(typeSelector).getAllByText("PDF")).toHaveLength(1);
  });
});

describe("borrowable closed-access", () => {
  const closedAccessBook = makeBook({
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 10
    }
  });
  test("displays borrow button", () => {
    const node = render(<FulfillmentCard book={closedAccessBook} />);
    const borrowButton = node.getByText("Borrow");
    expect(borrowButton).toBeInTheDocument();
  });
  test("displays number available", () => {
    const node = render(<FulfillmentCard book={closedAccessBook} />);
    expect(node.getByText("10 of 13 copies available.")).toBeInTheDocument();
  });
  test("shows loading state when borrowing, borrows, and refetches loans", async () => {
    /**
     * we will mock the actions.updateBook
     */
    const updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementation(_url => _dispatch =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(fixtures.book);
          }, 200);
        })
      );
    // we also spy on fetchLoans
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const node = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(node.getByText("Borrow"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");
    expect(await node.findByText("Loading...")).toBeInTheDocument();
    // we should refetch the loans after borrowing
    await wait(() => expect(fetchLoansSpy).toHaveBeenCalledTimes(1));
  });

  test("displays error message", () => {
    const err: FetchErrorData = {
      response: "cannot loan more than 3 documents.",
      status: 403,
      url: "error-url"
    };
    const node = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge(fixtures.initialState, {
        book: {
          error: err
        }
      })
    });
    expect(node.getByText("10 of 13 copies available.")).toBeInTheDocument();
    expect(
      node.getByText("Error: cannot loan more than 3 documents.")
    ).toBeInTheDocument();
  });
});

describe("none available", () => {
  describe("not reserved", () => {
    const unavailableBook = makeBook({
      openAccessLinks: [],
      copies: {
        total: 13,
        available: 0
      }
    });

    test("displays reserve button", () => {
      const node = render(<FulfillmentCard book={unavailableBook} />);
      const reserveButton = node.getByText("Reserve");
      expect(reserveButton).toBeInTheDocument();
    });

    test("shows number of patrons in queue when holds info present", () => {
      const bookWithQueue = makeBook({
        openAccessLinks: [],
        copies: {
          total: 13,
          available: 0
        },
        holds: {
          total: 4
        }
      });
      const node = render(<FulfillmentCard book={bookWithQueue} />);
      expect(node.getByText("0 of 13 copies available. 4 patrons in queue."));
    });

    test("doesn't show patrons in queue when holds info no present", () => {
      const node = render(<FulfillmentCard book={unavailableBook} />);
      expect(node.getByText("0 of 13 copies available."));
    });
  });

  describe("reserved", () => {
    const reservedBook = makeBook({
      availability: {
        status: "reserved"
      },
      openAccessLinks: [],
      copies: {
        total: 13,
        available: 0
      }
    });

    test("displays disabled reserve button", () => {
      const node = render(<FulfillmentCard book={reservedBook} />);
      const reserveButton = node.getByText("Reserved");
      expect(reserveButton).toBeInTheDocument();
      expect(reserveButton).toBeDisabled();
    });

    test("displays number of patrons in queue and your position", () => {
      const reservedBookWithQueue = makeBook({
        availability: {
          status: "reserved"
        },
        openAccessLinks: [],
        copies: {
          total: 13,
          available: 0
        },
        holds: {
          total: 23,
          position: 5
        }
      });
      const node = render(<FulfillmentCard book={reservedBookWithQueue} />);
      expect(
        node.getByText(
          "0 of 13 copies available. 23 patrons in queue. Your hold position: 5."
        )
      ).toBeInTheDocument;
    });
  });

  describe("borrowed", () => {
    const borrowedBook = makeBook({
      openAccessLinks: [],
      fulfillmentLinks: [
        {
          type: "application/pdf" as MediaType,
          url: "/pdf-fulfillment-link",
          indirectType: "indirect-type"
        },
        {
          type: "application/epub+zip" as MediaType,
          url: "/epub-fulfillment-link",
          indirectType: "indirect-type"
        }
      ],
      copies: {
        total: 13,
        available: 0
      }
    });

    test("download button calls fulfillBook", () => {
      const fulfillBookSpy = jest.spyOn(actions, "fulfillBook");

      const node = render(<FulfillmentCard book={borrowedBook} />);
      const downloadButton = node.getByText("Download");
      expect(downloadButton).toBeInTheDocument();

      userEvent.click(downloadButton);

      expect(fulfillBookSpy).toHaveBeenCalledTimes(1);
      expect(fulfillBookSpy).toHaveBeenCalledWith("/pdf-fulfillment-link");
    });

    test("shows time left when possible", () => {
      const withAvailabilityUntil = makeBook({
        openAccessLinks: [],
        fulfillmentLinks: [
          {
            type: "application/pdf" as MediaType,
            url: "/pdf-fulfillment-link",
            indirectType: "indirect-type"
          },
          {
            type: "application/epub+zip" as MediaType,
            url: "/epub-fulfillment-link",
            indirectType: "indirect-type"
          }
        ],
        copies: {
          total: 13,
          available: 0
        },
        availability: {
          until: "2020-07-11",
          status: "borrowed"
        }
      });
      const node = render(<FulfillmentCard book={withAvailabilityUntil} />);

      expect(node.getByText("You have this book on loan for two days"));
    });

    test("handles no availability.until data", () => {
      const node = render(<FulfillmentCard book={borrowedBook} />);

      expect(node.getByText("You have this book on loan."));
    });

    test("allows selecting type", () => {
      const node = render(<FulfillmentCard book={borrowedBook} />);
      const typeSelector = node.getByLabelText("TYPE");
      expect(within(typeSelector).getByText("PDF")).toBeInTheDocument();
      expect(within(typeSelector).getByText("EPUB")).toBeInTheDocument();
    });
  });
});
