import * as React from "react";
import { render, fixtures, actions, waitFor } from "test-utils";
import { mergeBook } from "test-utils/fixtures";
import merge from "deepmerge";
import FulfillmentCard from "../FulfillmentCard";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import userEvent from "@testing-library/user-event";
import { State } from "opds-web-client/lib/state";

describe("open-access", () => {
  test("correct title and subtitle", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      utils.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(utils.getByText("You're ready to read this book in SimplyE!"));
  });
  test("shows download options", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      utils.getByText("If you would rather read on your computer, you can:")
    );
    const downloadButton = utils.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("target", "__blank");
    expect(downloadButton).toHaveAttribute("href", "/epub-open-access-link");

    const PDFButton = utils.getByText("Download PDF");
    expect(PDFButton).toBeInTheDocument();
    expect(PDFButton).toHaveAttribute("target", "__blank");
    expect(PDFButton).toHaveAttribute("href", "/pdf-open-access-link");
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
    const utils = render(<FulfillmentCard book={bookWithDuplicateFormat} />);
    const downloadButton = utils.getAllByText("Download PDF");
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
    const utils = render(<FulfillmentCard book={closedAccessBook} />);
    expect(
      utils.getByText("This book is available to borrow!")
    ).toBeInTheDocument();
    expect(utils.getByText("10 out of 13 copies available."));
  });
  test("displays borrow button", () => {
    const utils = render(<FulfillmentCard book={closedAccessBook} />);
    const borrowButton = utils.getByText("Borrow");
    expect(borrowButton).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and refetches loans", async () => {
    // mock the actions.updateBook
    const updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementation(_url => _dispatch =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(fixtures.book);
          }, 1000);
        })
      );
    // also spy on fetchLoans
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const utils = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    // click borrow
    userEvent.click(utils.getByText("Borrow"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");
    const borrowButton = await utils.findByRole("button", {
      name: "Borrowing..."
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");
    // we should refetch the loans after borrowing
    await waitFor(() => expect(fetchLoansSpy).toHaveBeenCalledTimes(1));
  });

  test("displays error message", () => {
    const err: FetchErrorData = {
      response: "cannot loan more than 3 documents.",
      status: 403,
      url: "error-url"
    };
    const utils = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge(fixtures.initialState, {
        book: {
          error: err
        }
      })
    });
    expect(
      utils.getByText("10 out of 13 copies available.")
    ).toBeInTheDocument();
    expect(
      utils.getByText("Error: cannot loan more than 3 documents.")
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
    const utils = render(<FulfillmentCard book={readyBook} />);
    expect(
      utils.getByText("You can now borrow this book!")
    ).toBeInTheDocument();
    expect(utils.getByText("Your hold will expire on Tue Jun 16 2020."));
  });
  test("shows loading state when borrowing, borrows, and refetches loans", async () => {
    // mock the actions.updateBook
    const updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementation(_url => _dispatch =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(fixtures.book);
          }, 200);
        })
      );
    // also spy on fetchLoans
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const utils = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    // click borrow
    userEvent.click(utils.getByText("Borrow"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");
    const borrowButton = await utils.findByRole("button", {
      name: "Borrowing..."
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toBeDisabled();
    // we should refetch the loans after borrowing
    await waitFor(() => expect(fetchLoansSpy).toHaveBeenCalledTimes(1));
  });

  test("displays error message", () => {
    const err: FetchErrorData = {
      response: "cannot loan more than 3 documents.",
      status: 403,
      url: "error-url"
    };
    const utils = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge(fixtures.initialState, {
        book: {
          error: err
        }
      })
    });
    expect(
      utils.getByText("Error: cannot loan more than 3 documents.")
    ).toBeInTheDocument();
  });
  test("handles lack of availability.until info", () => {
    const withoutCopies = mergeBook({
      ...readyBook,
      availability: { status: "ready" }
    });
    const utils = render(<FulfillmentCard book={withoutCopies} />);
    expect(
      utils.getByText("You must borrow this book before your loan expires.")
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
    const utils = render(<FulfillmentCard book={unavailableBook} />);
    expect(
      utils.getByText("This book is currently unavailable.")
    ).toBeInTheDocument();
    expect(
      utils.getByText("0 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("displays reserve button", () => {
    const utils = render(<FulfillmentCard book={unavailableBook} />);
    const reserveButton = utils.getByRole("button", { name: "Reserve" });
    expect(reserveButton).toBeInTheDocument();
  });

  test("shows number of patrons in queue when holds info present", () => {
    const bookWithQueue = mergeBook({
      ...unavailableBook,
      holds: {
        total: 4
      }
    });
    const utils = render(<FulfillmentCard book={bookWithQueue} />);
    expect(
      utils.getByText("0 out of 13 copies available. 4 patrons in the queue.")
    );
  });

  test("doesn't show patrons in queue when holds info no present", () => {
    const utils = render(<FulfillmentCard book={unavailableBook} />);
    expect(
      utils.getByText("0 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("handles unknown availability numbers", () => {
    const bookWithQueue = mergeBook({
      openAccessLinks: [],
      copies: undefined
    });
    // this is currently failing because the getFulfillmentState is returning error
    // since we expect to always have the availability numbers otherwise we don't know
    // if the book is available or not, unless there is some other way to tell that state.
    const utils = render(<FulfillmentCard book={bookWithQueue} />);
    expect(utils.getByText("Number of books available is unknown."));
  });

  test("shows loading state when reserving, reserves, and refetches loans", async () => {
    // mock the actions.updateBook
    const updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementation(_url => _dispatch =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(fixtures.book);
          }, 1000);
        })
      );
    // also spy on fetchLoans
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const utils = render(<FulfillmentCard book={unavailableBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    // click reserve
    userEvent.click(utils.getByText("Reserve"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");
    const reserveButton = await utils.findByRole("button", {
      name: "Reserving..."
    });
    expect(reserveButton).toBeInTheDocument();
    expect(reserveButton).toHaveAttribute("disabled", "");
    // we should refetch the loans after borrowing
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
    const utils = render(<FulfillmentCard book={reservedBook} />);
    const reserveButton = utils.getByText("Reserved");
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
    const utils = render(<FulfillmentCard book={reservedBookWithQueue} />);
    expect(utils.getByText("Your hold position is: 5.")).toBeInTheDocument;
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
    const utils = render(<FulfillmentCard book={downloadableBook} />);
    expect(
      utils.getByText("You have this book on loan until Thu Jun 18 2020.")
    ).toBeInTheDocument();
    expect(utils.getByText("You're ready to read this book in SimplyE!"));
  });

  test("handles lack of availability info", () => {
    const withoutAvailability = mergeBook({
      ...downloadableBook,
      availability: undefined
    });
    const utils = render(<FulfillmentCard book={withoutAvailability} />);
    expect(utils.getByText("You have this book on loan.")).toBeInTheDocument();
    expect(utils.getByText("You're ready to read this book in SimplyE!"));
  });

  test("shows download options", () => {
    const utils = render(<FulfillmentCard book={downloadableBook} />);
    expect(
      utils.getByText("If you would rather read on your computer, you can:")
    );
    const downloadButton = utils.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    const PDFButton = utils.getByText("Download PDF");
    expect(PDFButton).toBeInTheDocument();
  });

  test("download button calls fulfillBook", () => {
    const fulfillBookSpy = jest.spyOn(actions, "fulfillBook");

    const utils = render(<FulfillmentCard book={downloadableBook} />);
    const downloadButton = utils.getByText("Download EPUB");
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

    const utils = render(<FulfillmentCard book={bookWithIndirect} />);
    const downloadButton = utils.getByText("Download atom");
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

    const utils = render(<FulfillmentCard book={bookWithIndirect} />);
    const downloadButton = utils.getByText("Read Online");
    expect(downloadButton).toBeInTheDocument();

    userEvent.click(downloadButton);

    expect(indirectFulfillSpy).toHaveBeenCalledTimes(1);
    expect(indirectFulfillSpy).toHaveBeenCalledWith(
      "/streaming",
      "text/html;profile=http://librarysimplified.org/terms/profiles/streaming-media"
    );
  });
});
