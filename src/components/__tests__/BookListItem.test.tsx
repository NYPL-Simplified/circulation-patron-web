import * as React from "react";
import { render, fixtures, waitFor } from "test-utils";
import { BookListItem } from "components/BookList";
import userEvent from "@testing-library/user-event";
import * as fetch from "dataflow/opds1/fetch";
import mockUser from "test-utils/mockUser";

function expectViewDetails(utils: ReturnType<typeof render>) {
  const button = utils.getByRole("link", { name: "View Book Details" });
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute("href", "/book/http%3A%2F%2Ftest-book-url");
}

describe("open access book", () => {
  test("renders with view details button", () => {
    const utils = render(<BookListItem book={fixtures.book} />);
    expect(
      utils.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expectViewDetails(utils);
  });

  test("shows borrow button if not yet loaned", () => {
    const utils = render(<BookListItem book={fixtures.book} />);
    expect(
      utils.getByRole("button", { name: "Borrow to read on a mobile device" })
    ).toBeInTheDocument();
  });

  test("shows no borrow button when book is loaned", async () => {
    mockUser();
    const utils = render(
      <BookListItem
        book={{
          ...fixtures.book,
          fulfillmentLinks: [
            {
              type: "application/atom+xml;type=entry;profile=opds-catalog",
              url: "/download"
            }
          ]
        }}
      />
    );

    await waitFor(() =>
      expect(
        utils.queryByText("Borrow to read on a mobile device")
      ).not.toBeInTheDocument()
    );
    expectViewDetails(utils);
  });

  test("renders without borrow button if no borrow url present", () => {
    const noAuthBook = fixtures.mergeBook({
      borrowUrl: undefined
    });
    const utils = render(<BookListItem book={noAuthBook} />);
    expect(
      utils.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(utils.queryByText("Borrow to read on a mobile device")).toBeNull();
    expectViewDetails(utils);
  });

  test("renders subtitle if provided", () => {
    const bookWithSubtitle = fixtures.mergeBook({
      subtitle:
        "Book subtitle that is quite long-winded and will break the ux if not truncated"
    });
    const utils = render(<BookListItem book={bookWithSubtitle} />);
    expect(
      utils.getByText("Book subtitle that is quite long-winded and will...")
    ).toBeInTheDocument();
  });
});

(fetch as any).fetchBook = jest.fn();
const mockFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

describe("available to borrow book", () => {
  const closedAccessBook = fixtures.mergeBook({
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 10
    }
  });

  test("shows correct string and link to book details", () => {
    const utils = render(<BookListItem book={closedAccessBook} />);
    expectViewDetails(utils);
    expect(
      utils.getByText("10 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockUser({
      setBook: mockSetBook,
      isAuthenticated: true,
      loans: fixtures.loans.books
    });
    mockFetchBook.mockResolvedValue(closedAccessBook);

    const utils = render(<BookListItem book={closedAccessBook} />);

    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/epub-borrow-link",
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
      expect(mockSetBook).toHaveBeenCalledWith(closedAccessBook)
    );
  });
});

describe("ready to borrow book", () => {
  const readyBook = fixtures.mergeBook({
    openAccessLinks: undefined,
    fulfillmentLinks: undefined,
    availability: {
      status: "ready",
      until: "2020-06-16"
    }
  });

  test("shows correct string and link to book details", () => {
    const utils = render(<BookListItem book={readyBook} />);
    expectViewDetails(utils);
    expect(
      utils.getByText("You can now borrow this book!")
    ).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockUser({
      setBook: mockSetBook,
      isAuthenticated: true,
      loans: fixtures.loans.books
    });
    mockFetchBook.mockResolvedValue(readyBook);

    const utils = render(<BookListItem book={readyBook} />);

    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/epub-borrow-link",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = utils.getByRole("button", {
      name: /Borrowing.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() => expect(mockSetBook).toHaveBeenCalledWith(readyBook));
  });
});

describe("ready to borrow book with multiple borrowUrls", () => {
  const readyBook = fixtures.mergeBook({
    openAccessLinks: undefined,
    fulfillmentLinks: undefined,
    availability: {
      status: "ready",
      until: "2020-06-16"
    },
    allBorrowLinks: [
      {
        url: "/adobe-borrow-link",
        type: "application/atom+xml;type=entry;profile=opds-catalog",
        indirectType: "application/kepub+zip"
      },
      {
        url: "/axis-borrow-link",
        type: "application/atom+xml;type=entry;profile=opds-catalog",
        indirectType: "application/vnd.librarysimplified.axisnow+json"
      }
    ]
  });

  test("shows two borrow buttons if books there are multiple borrow urls", () => {
    const utils = render(<BookListItem book={readyBook} />);
    expect(
      utils.getByRole("button", { name: "Borrow to read on a mobile device" })
    ).toBeInTheDocument();
    expect(
      utils.getByRole("button", { name: "Borrow to read online" })
    ).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockUser({
      setBook: mockSetBook,
      isAuthenticated: true,
      loans: fixtures.loans.books
    });
    mockFetchBook.mockResolvedValue(readyBook);

    const utils = render(<BookListItem book={readyBook} />);

    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/adobe-borrow-link",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = utils.getByRole("button", {
      name: /Borrowing.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() => expect(mockSetBook).toHaveBeenCalledWith(readyBook));
  });
});

describe("available to reserve book", () => {
  const unavailableBook = fixtures.mergeBook({
    availability: {
      status: "unavailable"
    },
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 0
    }
  });

  test("displays correct title and subtitle", () => {
    const utils = render(<BookListItem book={unavailableBook} />);
    expect(
      utils.getByText("0 out of 13 copies available.")
    ).toBeInTheDocument();
    expectViewDetails(utils);
  });

  test("displays reserve button", () => {
    const utils = render(<BookListItem book={unavailableBook} />);
    const reserveButton = utils.getByRole("button", { name: "Reserve" });
    expect(reserveButton).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockUser({
      setBook: mockSetBook,
      isAuthenticated: true,
      loans: fixtures.loans.books
    });
    mockFetchBook.mockResolvedValue(unavailableBook);

    const utils = render(<BookListItem book={unavailableBook} />);

    // click borrow
    userEvent.click(utils.getByText("Reserve"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/epub-borrow-link",
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
      expect(mockSetBook).toHaveBeenCalledWith(unavailableBook)
    );
  });
});

describe("reserved book", () => {
  const reservedBook = fixtures.mergeBook({
    availability: {
      status: "reserved"
    },
    openAccessLinks: [],
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
    const reservedBookWithQueue = fixtures.mergeBook({
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
    const utils = render(<BookListItem book={reservedBookWithQueue} />);
    expect(
      utils.getByText("You have this book on hold. Position: 5")
    ).toBeInTheDocument();
  });
});

describe("available to access book", () => {
  const downloadableBook = fixtures.mergeBook({
    openAccessLinks: undefined,
    fulfillmentLinks: [
      {
        url: "/epub-link",
        type: "application/epub+zip"
      },
      {
        url: "/pdf-link",
        type: "application/pdf"
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
