import * as React from "react";
import { render, fixtures, waitFor } from "test-utils";
import { BookListItem } from "components/BookList";
import userEvent from "@testing-library/user-event";
import * as fetch from "dataflow/opds1/fetch";
import {
  BorrowableBook,
  FulfillableBook,
  OnHoldBook,
  ReservableBook,
  ReservedBook
} from "interfaces";
import { mergeBook, mockSetBook } from "test-utils/fixtures";

function expectReadMore(utils: ReturnType<typeof render>) {
  const link = utils.getByRole("link", { name: "Read more" });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute(
    "href",
    "/testlib/book/http%3A%2F%2Ftest-book-url"
  );
}

/**
 * Borrowable
 * OnHold
 * Reservable
 * Reserved
 * Fulfillable
 * Unsupported
 */

(fetch as any).fetchBook = jest.fn();
const mockFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

describe("BorrowableBook", () => {
  const borrowableBook = fixtures.mergeBook<BorrowableBook>({
    status: "borrowable",
    borrowUrl: "/borrow",
    copies: {
      total: 13,
      available: 10
    }
  });

  test("shows correct string and link to book details", () => {
    const utils = render(<BookListItem book={borrowableBook} />);
    expectReadMore(utils);
    expect(
      utils.getByText("10 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockFetchBook.mockResolvedValue(borrowableBook);
    const utils = render(<BookListItem book={borrowableBook} />, {
      user: {
        setBook: mockSetBook,
        isAuthenticated: true,
        loans: fixtures.loans.books
      }
    });

    // click borrow
    userEvent.click(utils.getByText("Borrow this book"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/borrow",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = utils.getByRole("button", {
      name: /Borrowing.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(borrowableBook)
    );
  });
});

describe("OnHoldBook", () => {
  const onHoldBook = fixtures.mergeBook<OnHoldBook>({
    status: "on-hold",
    borrowUrl: "/borrow",
    availability: {
      status: "ready",
      until: "2020-06-16"
    }
  });

  test("shows correct string and link to book details", () => {
    const utils = render(<BookListItem book={onHoldBook} />);
    expectReadMore(utils);
    expect(utils.getByText("Ready to Borrow")).toBeInTheDocument();
    expect(
      utils.getByText("You have this book on hold until Tue Jun 16 2020.")
    ).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockFetchBook.mockResolvedValue(onHoldBook);

    const utils = render(<BookListItem book={onHoldBook} />, {
      user: {
        setBook: mockSetBook,
        isAuthenticated: true,
        loans: fixtures.loans.books
      }
    });

    // click borrow
    userEvent.click(utils.getByText("Borrow this book"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/borrow",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = utils.getByRole("button", {
      name: /Borrowing.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() => expect(mockSetBook).toHaveBeenCalledWith(onHoldBook));
  });
});

describe("ReservableBook", () => {
  const reservableBook = fixtures.mergeBook<ReservableBook>({
    reserveUrl: "/reserve",
    status: "reservable",
    availability: {
      status: "unavailable"
    },
    copies: {
      total: 13,
      available: 0
    }
  });

  test("displays correct title and subtitle", () => {
    const utils = render(<BookListItem book={reservableBook} />);
    expect(
      utils.getByText("0 out of 13 copies available.")
    ).toBeInTheDocument();
    expectReadMore(utils);
  });

  test("displays reserve button", () => {
    const utils = render(<BookListItem book={reservableBook} />);
    const reserveButton = utils.getByRole("button", {
      name: "Reserve this book"
    });
    expect(reserveButton).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockFetchBook.mockResolvedValue(reservableBook);

    const utils = render(<BookListItem book={reservableBook} />, {
      user: {
        setBook: mockSetBook,
        isAuthenticated: true,
        loans: fixtures.loans.books
      }
    });

    // click borrow
    userEvent.click(utils.getByText("Reserve this book"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/reserve",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = utils.getByRole("button", {
      name: /Reserving.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(reservableBook)
    );
  });
});

describe("ReservedBook", () => {
  const reservedBook = fixtures.mergeBook<ReservedBook>({
    status: "reserved",
    revokeUrl: "/revoke",
    availability: {
      status: "reserved"
    },
    copies: {
      total: 13,
      available: 0
    }
  });

  test("displays reserved status and string ", () => {
    const utils = render(<BookListItem book={reservedBook} />);
    expect(utils.getByText("Reserved"));
  });

  test("allows cancelling reservation", async () => {
    const unreservedBook = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow"
    });
    mockFetchBook.mockResolvedValue(unreservedBook);
    const utils = render(<BookListItem book={reservedBook} />);
    expect(utils.getByText("Reserved"));
    const cancel = utils.getByRole("button", { name: "Cancel Reservation" });
    expect(cancel).toBeInTheDocument();

    userEvent.click(cancel);

    expect(
      await utils.findByRole("button", { name: "Cancelling..." })
    ).toBeInTheDocument();

    expect(mockFetchBook).toHaveBeenCalledWith(
      "/revoke",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );

    expect(mockSetBook).toHaveBeenCalledWith(unreservedBook, reservedBook.id);
  });

  test("displays number of patrons in queue and your position", () => {
    const reservedBookWithQueue = fixtures.mergeBook<ReservedBook>({
      status: "reserved",
      revokeUrl: "/revoke",
      availability: {
        status: "reserved"
      },
      copies: {
        total: 13,
        available: 0
      },
      holds: {
        total: 23,
        position: 5
      }
    });
    const utils = render(<BookListItem book={reservedBookWithQueue} />);
    expect(
      utils.getByText("5 patrons ahead of you in the queue.")
    ).toBeInTheDocument();
  });
});

describe("FulfillableBook", () => {
  const downloadableBook = fixtures.mergeBook<FulfillableBook>({
    status: "fulfillable",
    revokeUrl: "/revoke",
    fulfillmentLinks: [
      {
        url: "/epub-link",
        supportLevel: "show",
        contentType: "application/epub+zip"
      },
      {
        url: "/pdf-link",
        supportLevel: "show",
        contentType: "application/pdf"
      }
    ],
    availability: {
      status: "available",
      until: "2020-06-18"
    }
  });

  test("displays FulfillmentButton if only one possibility", () => {
    const book = fixtures.mergeBook<FulfillableBook>({
      status: "fulfillable",
      revokeUrl: "/revoke",
      fulfillmentLinks: [
        {
          url: "/pdf-link",
          supportLevel: "show",
          contentType: "application/pdf"
        },
        {
          url: "/pdf-link",
          supportLevel: "unsupported",
          contentType: "application/pdf"
        }
      ],
      availability: {
        status: "available",
        until: "2020-06-18"
      }
    });
    const utils = render(<BookListItem book={book} />);
    expect(
      utils.getByRole("button", { name: "Download PDF" })
    ).toBeInTheDocument();
  });

  test("doesn't show FulfillmentButton if multiple options", () => {
    const utils = render(<BookListItem book={downloadableBook} />);
    expect(utils.queryByText("Download PDF")).not.toBeInTheDocument();
  });

  test("displays correct title and subtitle and view details", () => {
    const utils = render(<BookListItem book={downloadableBook} />);
    expect(
      utils.getByText("You have this book on loan until Thu Jun 18 2020.")
    ).toBeInTheDocument();
    expectReadMore(utils);
  });

  test("handles lack of availability info", () => {
    const withoutAvailability = fixtures.mergeBook({
      ...downloadableBook,
      availability: undefined
    });
    const utils = render(<BookListItem book={withoutAvailability} />);
    expect(utils.getByText("Ready to Read!")).toBeInTheDocument();
  });
});
