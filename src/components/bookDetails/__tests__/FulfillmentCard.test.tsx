import * as React from "react";
import {
  render,
  fixtures,
  actions,
  waitFor,
  waitForElementToBeRemoved
} from "test-utils";
import { mergeBook } from "test-utils/fixtures";
import merge from "deepmerge";
import FulfillmentCard from "../FulfillmentCard";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import userEvent from "@testing-library/user-event";
import { State } from "opds-web-client/lib/state";
import * as useBorrow from "hooks/useBorrow";
import _download from "opds-web-client/lib/components/download";

jest.mock("opds-web-client/lib/components/download");
window.open = jest.fn();

describe("open-access", () => {
  const stateWithLoanedBook = merge<State>(fixtures.initialState, {
    loans: {
      url: "/loans",
      books: [fixtures.book]
    }
  });

  test("correct title and subtitle when not loaned", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      node.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(node.getByRole("button", { name: "Borrow" })).toBeInTheDocument();
  });

  test("correct title and subtitle when loaned", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />, {
      initialState: stateWithLoanedBook
    });
    expect(
      node.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(
      node.getByText("You're ready to read this book in SimplyE!")
    ).toBeInTheDocument();
  });

  test("shows download options if loaned", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />, {
      initialState: stateWithLoanedBook
    });

    expect(
      node.getByText("If you would rather read on your computer, you can:")
    );

    const downloadButton = node.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    const PDFButton = node.getByText("Download PDF");
    expect(PDFButton).toBeInTheDocument();
  });

  test("clicking download calls fulfill book", () => {
    const fulfillBookSpy = jest.spyOn(actions, "fulfillBook");

    const node = render(<FulfillmentCard book={fixtures.book} />, {
      initialState: stateWithLoanedBook
    });
    const downloadButton = node.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    userEvent.click(downloadButton);

    expect(fulfillBookSpy).toHaveBeenCalledTimes(1);
    expect(fulfillBookSpy).toHaveBeenCalledWith("/epub-open-access-link");
  });

  test("doesn't show duplicate download options", () => {
    const bookWithDuplicateFormat = mergeBook({
      openAccessLinks: [
        ...fixtures.book.openAccessLinks,
        {
          type: "application/pdf",
          url: "/pdf-open-access-link-2"
        },
        {
          type: "application/pdf",
          url: "/pdf-open-access-link-3"
        }
      ]
    });
    const stateWithDuplicateFormatLoan = merge(fixtures.initialState, {
      loans: {
        url: "/loans",
        books: [bookWithDuplicateFormat]
      }
    });
    const node = render(<FulfillmentCard book={bookWithDuplicateFormat} />, {
      initialState: stateWithDuplicateFormatLoan
    });

    const downloadButton = node.getAllByText("Download PDF");
    expect(downloadButton).toHaveLength(1);
  });
});

describe("available to borrow", () => {
  const closedAccessBook = mergeBook({
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 10
    }
  });
  test("correct title and subtitle", () => {
    const node = render(<FulfillmentCard book={closedAccessBook} />);
    expect(
      node.getByText("This book is available to borrow!")
    ).toBeInTheDocument();
    expect(node.getByText("10 out of 13 copies available."));
  });
  test("displays borrow button which calls updateBook correctly", async () => {
    const updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementation(_url => _dispatch => Promise.resolve(fixtures.book));

    const node = render(<FulfillmentCard book={closedAccessBook} />);
    const borrowButton = node.getByText("Borrow");
    expect(borrowButton).toBeInTheDocument();

    // click borrow
    userEvent.click(node.getByText("Borrow"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => node.getByText("Borrowing..."));
  });

  test("shows loading state when borrowing", async () => {
    const _useBorrowSpy = jest.spyOn(useBorrow, "default").mockReturnValueOnce({
      isLoading: true,
      borrowOrReserve: jest.fn(),
      errorMsg: null
    });

    // set it up into the loading state
    const node = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });

    const borrowButton = await node.findByRole("button", {
      name: "Borrowing..."
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");
  });

  test("calls fetch loans after borrowing", async () => {
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const _updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementationOnce(_url => _dispatch =>
        new Promise(resolve => resolve(fixtures.book))
      );

    const node = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(node.getByText("Borrow"));

    await waitForElementToBeRemoved(() => node.getByText("Borrowing..."));
    await waitFor(() => expect(fetchLoansSpy).toHaveBeenCalledTimes(1));
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
    expect(
      node.getByText("10 out of 13 copies available.")
    ).toBeInTheDocument();
    expect(
      node.getByText("Error: cannot loan more than 3 documents.")
    ).toBeInTheDocument();
  });
});

describe("ready to borrow", () => {
  const readyBook = mergeBook({
    openAccessLinks: undefined,
    fulfillmentLinks: undefined,
    availability: {
      status: "ready",
      until: "2020-06-16"
    }
  });

  test("correct title and subtitle", () => {
    const node = render(<FulfillmentCard book={readyBook} />);
    expect(node.getByText("You can now borrow this book!")).toBeInTheDocument();
    expect(node.getByText("Your hold will expire on Tue Jun 16 2020."));
  });

  test("displays borrow button which calls updateBook", async () => {
    const updateBookSpy = jest.spyOn(actions, "updateBook");

    const node = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    // click borrow
    userEvent.click(node.getByText("Borrow"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => node.getByText("Borrowing..."));
  });

  test("shows loading state when borrowing", async () => {
    const _useBorrowSpy = jest.spyOn(useBorrow, "default").mockReturnValueOnce({
      isLoading: true,
      borrowOrReserve: jest.fn(),
      errorMsg: null
    });

    const node = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });

    const borrowButton = await node.findByRole("button", {
      name: "Borrowing..."
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");
  });

  test("refetches loans after borrowing", async () => {
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const _updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementationOnce(_url => _dispatch =>
        new Promise(resolve => resolve(fixtures.book))
      );
    const node = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(node.getByText("Borrow"));
    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => node.getByText("Borrowing..."));
    await waitFor(() => expect(fetchLoansSpy).toHaveBeenCalledTimes(1));
  });

  test("displays error message", () => {
    const err: FetchErrorData = {
      response: "cannot loan more than 3 documents.",
      status: 403,
      url: "error-url"
    };
    const node = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge(fixtures.initialState, {
        book: {
          error: err
        }
      })
    });
    expect(
      node.getByText("Error: cannot loan more than 3 documents.")
    ).toBeInTheDocument();
  });
  test("handles lack of availability.until info", () => {
    const withoutCopies = mergeBook({
      ...readyBook,
      availability: { status: "ready" }
    });
    const node = render(<FulfillmentCard book={withoutCopies} />);
    expect(
      node.getByText("You must borrow this book before your loan expires.")
    );
  });
});

describe("available to reserve", () => {
  const unavailableBook = mergeBook({
    availability: {
      status: "unavailable"
    },
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 0
    }
  });

  test("correct title and subtitle", () => {
    const node = render(<FulfillmentCard book={unavailableBook} />);
    expect(
      node.getByText("This book is currently unavailable.")
    ).toBeInTheDocument();
    expect(node.getByText("0 out of 13 copies available.")).toBeInTheDocument();
  });

  test("displays reserve button", () => {
    const node = render(<FulfillmentCard book={unavailableBook} />);
    const reserveButton = node.getByRole("button", { name: "Reserve" });
    expect(reserveButton).toBeInTheDocument();
  });

  test("shows number of patrons in queue when holds info present", () => {
    const bookWithQueue = mergeBook({
      ...unavailableBook,
      holds: {
        total: 4
      }
    });
    const node = render(<FulfillmentCard book={bookWithQueue} />);
    expect(
      node.getByText("0 out of 13 copies available. 4 patrons in the queue.")
    );
  });

  test("doesn't show patrons in queue when holds info no present", () => {
    const node = render(<FulfillmentCard book={unavailableBook} />);
    expect(node.getByText("0 out of 13 copies available.")).toBeInTheDocument();
  });

  test("handles unknown availability numbers", () => {
    const bookWithQueue = mergeBook({
      openAccessLinks: [],
      copies: undefined
    });
    // this is currently failing because the getFulfillmentState is returning error
    // since we expect to always have the availability numbers otherwise we don't know
    // if the book is available or not, unless there is some other way to tell that state.
    const node = render(<FulfillmentCard book={bookWithQueue} />);
    expect(node.getByText("Number of books available is unknown."));
  });

  test("shows reserve button which calls updateBook", async () => {
    const updateBookSpy = jest.spyOn(actions, "updateBook");
    const node = render(<FulfillmentCard book={unavailableBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(node.getByText("Reserve"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");

    // the reserve button should be gone now
    await waitForElementToBeRemoved(() => node.getByText("Reserving..."));
  });
  test("shows loading state when reserving", async () => {
    const _useBorrowSpy = jest.spyOn(useBorrow, "default").mockReturnValueOnce({
      isLoading: true,
      borrowOrReserve: jest.fn(),
      errorMsg: null
    });
    const node = render(<FulfillmentCard book={unavailableBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    const reserveButton = await node.findByRole("button", {
      name: "Reserving..."
    });
    expect(reserveButton).toBeInTheDocument();
    expect(reserveButton).toHaveAttribute("disabled", "");
  });
  test("refetches loans after reserving", async () => {
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const _updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementationOnce(_url => _dispatch =>
        new Promise(resolve => resolve(fixtures.book))
      );
    const node = render(<FulfillmentCard book={unavailableBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(node.getByText("Reserve"));
    await waitFor(() => expect(fetchLoansSpy).toHaveBeenCalledTimes(1));
  });
});

describe("reserved", () => {
  const reservedBook = mergeBook({
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
    const reservedBookWithQueue = mergeBook({
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
    expect(node.getByText("Your hold position is: 5.")).toBeInTheDocument;
  });
});

describe("available to download", () => {
  const downloadableBook = mergeBook({
    openAccessLinks: undefined,
    fulfillmentLinks: [
      {
        url: "/epub-link",
        type: "application/epub+zip",
        indirectType: "indirect"
      },
      {
        url: "/pdf-link",
        type: "application/pdf",
        indirectType: "indirect"
      }
    ],
    availability: {
      status: "available",
      until: "2020-06-18"
    }
  });

  test("correct title and subtitle", () => {
    const node = render(<FulfillmentCard book={downloadableBook} />);
    expect(
      node.getByText("You have this book on loan until Thu Jun 18 2020.")
    ).toBeInTheDocument();
    expect(node.getByText("You're ready to read this book in SimplyE!"));
  });

  test("handles lack of availability info", () => {
    const withoutAvailability = mergeBook({
      ...downloadableBook,
      availability: undefined
    });
    const node = render(<FulfillmentCard book={withoutAvailability} />);
    expect(node.getByText("You have this book on loan.")).toBeInTheDocument();
    expect(node.getByText("You're ready to read this book in SimplyE!"));
  });

  test("shows download options", () => {
    const node = render(<FulfillmentCard book={downloadableBook} />);
    expect(
      node.getByText("If you would rather read on your computer, you can:")
    );
    const downloadButton = node.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    const PDFButton = node.getByText("Download PDF");
    expect(PDFButton).toBeInTheDocument();
  });

  test("download button calls fulfillBook", () => {
    const fulfillBookSpy = jest.spyOn(actions, "fulfillBook");

    const node = render(<FulfillmentCard book={downloadableBook} />);
    const downloadButton = node.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    userEvent.click(downloadButton);

    expect(fulfillBookSpy).toHaveBeenCalledTimes(1);
    expect(fulfillBookSpy).toHaveBeenCalledWith("/epub-link");
  });

  test("download button calls indirect fullfill when book is indirect", () => {
    const bookWithIndirect = mergeBook({
      ...downloadableBook,
      fulfillmentLinks: [
        {
          url: "/indirect",
          type: "application/atom+xml;type=entry;profile=opds-catalog",
          indirectType: "something-indirect"
        }
      ]
    });

    const indirectFulfillSpy = jest.spyOn(actions, "indirectFulfillBook");

    const node = render(<FulfillmentCard book={bookWithIndirect} />);
    const downloadButton = node.getByText("Download atom");
    expect(downloadButton).toBeInTheDocument();

    userEvent.click(downloadButton);

    expect(indirectFulfillSpy).toHaveBeenCalledTimes(1);
    expect(indirectFulfillSpy).toHaveBeenCalledWith(
      "/indirect",
      "something-indirect"
    );
  });

  test("says read online for streaming media", () => {
    const bookWithIndirect = mergeBook({
      ...downloadableBook,
      fulfillmentLinks: [
        {
          url: "/streaming",
          type: "application/atom+xml;type=entry;profile=opds-catalog",
          indirectType:
            "text/html;profile=http://librarysimplified.org/terms/profiles/streaming-media"
        }
      ]
    });

    const indirectFulfillSpy = jest.spyOn(actions, "indirectFulfillBook");

    const node = render(<FulfillmentCard book={bookWithIndirect} />);
    const downloadButton = node.getByText("Read Online");
    expect(downloadButton).toBeInTheDocument();

    userEvent.click(downloadButton);

    expect(indirectFulfillSpy).toHaveBeenCalledTimes(1);
    expect(indirectFulfillSpy).toHaveBeenCalledWith(
      "/streaming",
      "text/html;profile=http://librarysimplified.org/terms/profiles/streaming-media"
    );
  });
});
