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

function expectViewDetails(utils: ReturnType<typeof render>) {
  const button = utils.getByRole("link", { name: "View Book Details" });
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute(
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
    expectViewDetails(utils);
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
    userEvent.click(utils.getByText("Borrow"));
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
    expectViewDetails(utils);
    expect(utils.getByText("You have this book on hold.")).toBeInTheDocument();
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
    userEvent.click(utils.getByText("Borrow"));
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
    expectViewDetails(utils);
  });

  test("displays reserve button", () => {
    const utils = render(<BookListItem book={reservableBook} />);
    const reserveButton = utils.getByRole("button", { name: "Reserve" });
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
    userEvent.click(utils.getByText("Reserve"));
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

  test("displays disabled reserve button and text", () => {
    const utils = render(<BookListItem book={reservedBook} />);
    const reserveButton = utils.getByText("Reserved");
    expect(reserveButton).toBeInTheDocument();
    expect(reserveButton).toBeDisabled();

    expect(utils.getByText("You have this book on hold.")).toBeInTheDocument();
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
      utils.getByText("You have this book on hold. Position: 5")
    ).toBeInTheDocument();
  });
});

describe("available to access book", () => {
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

  test("displays correct title and subtitle and view details", () => {
    const utils = render(<BookListItem book={downloadableBook} />);
    expect(
      utils.getByText("You have this book on loan until Thu Jun 18 2020.")
    ).toBeInTheDocument();
    expectViewDetails(utils);
  });

  test("handles lack of availability info", () => {
    const withoutAvailability = fixtures.mergeBook({
      ...downloadableBook,
      availability: undefined
    });
    const utils = render(<BookListItem book={withoutAvailability} />);
    expect(utils.getByText("You have this book on loan.")).toBeInTheDocument();
  });
});
