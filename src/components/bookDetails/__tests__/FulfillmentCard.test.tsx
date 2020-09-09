import * as React from "react";
import {
  render,
  fixtures,
  actions,
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

import * as env from "../../../utils/env";

jest.mock("opds-web-client/lib/components/download");
window.open = jest.fn();

const loadingBorrowState = {
  isLoading: true,
  borrowOrReserve: jest.fn(),
  errorMsg: null,
  buttonLabel: "Button Label",
  loadingText: "Loading Label"
};

describe("open-access", () => {
  const stateWithLoanedBook = merge<State>(fixtures.initialState, {
    loans: {
      url: "/loans",
      books: [fixtures.book]
    }
  });

  test("correct title and subtitle when not loaned", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      utils.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(utils.getByRole("button", { name: /Borrow/i })).toBeInTheDocument();
  });

  test("correct title and subtitle when loaned", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />, {
      initialState: stateWithLoanedBook
    });
    expect(
      utils.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(
      utils.getByText("You're ready to read this book in SimplyE!")
    ).toBeInTheDocument();
  });

  test("shows download options if loaned", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />, {
      initialState: stateWithLoanedBook
    });

    expect(
      utils.getByText("If you would rather read on your computer, you can:")
    );

    const downloadButton = utils.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    const PDFButton = utils.getByText("Download PDF");
    expect(PDFButton).toBeInTheDocument();
  });

  test("clicking download calls fulfill book", () => {
    const fulfillBookSpy = jest.spyOn(actions, "fulfillBook");

    const utils = render(<FulfillmentCard book={fixtures.book} />, {
      initialState: stateWithLoanedBook
    });
    const downloadButton = utils.getByText("Download EPUB");
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
    const utils = render(<FulfillmentCard book={bookWithDuplicateFormat} />, {
      initialState: stateWithDuplicateFormatLoan
    });

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
  test("displays borrow button which calls updateBook correctly", async () => {
    const updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementation(_url => _dispatch => Promise.resolve(fixtures.book));

    const utils = render(<FulfillmentCard book={closedAccessBook} />);
    const borrowButton = utils.getByText("Borrow to read on a mobile device");
    expect(borrowButton).toBeInTheDocument();

    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("/epub-borrow-link");

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
  });

  test("shows loading state when borrowing", async () => {
    const _useBorrowSpy = jest
      .spyOn(useBorrow, "default")
      .mockReturnValueOnce(loadingBorrowState);

    // set it up into the loading state
    const utils = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });

    const borrowButton = await utils.findByRole("button", {
      name: /Loading Label/i
    });

    expect(_useBorrowSpy).toHaveBeenCalledTimes(1);

    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");
  });

  test("doesn't refetch loans after borrowing", async () => {
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const _updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementationOnce(_url => _dispatch =>
        new Promise(resolve => resolve(fixtures.book))
      );

    const utils = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));

    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
    expect(fetchLoansSpy).toHaveBeenCalledTimes(0);
  });

  test("displays error message", () => {
    const err: FetchErrorData = {
      response: "cannot loan more than 3 documents.",
      status: 403,
      url: "/test-book-url/error-url"
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

  test("displays borrow button which calls updateBook", async () => {
    const updateBookSpy = jest.spyOn(actions, "updateBook");

    const utils = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("/epub-borrow-link");

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
  });

  test("shows loading state when borrowing", async () => {
    const _useBorrowSpy = jest
      .spyOn(useBorrow, "default")
      .mockReturnValueOnce(loadingBorrowState);

    const utils = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });

    const borrowButton = await utils.findByRole("button", {
      name: /Loading Label/i
    });

    expect(_useBorrowSpy).toHaveBeenCalledTimes(1);

    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");
  });

  test("doesn't refetch loans after borrowing", async () => {
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const _updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementationOnce(_url => _dispatch =>
        new Promise(resolve => resolve(fixtures.book))
      );
    const utils = render(<FulfillmentCard book={readyBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
    expect(fetchLoansSpy).toHaveBeenCalledTimes(0);
  });

  test("displays error message", () => {
    const err: FetchErrorData = {
      response: "cannot loan more than 3 documents.",
      status: 403,
      url: "/test-book-url/error-url"
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

describe("ready to borrow (two links)", () => {
  const readyBookWithTwoBorrowLinks = mergeBook({
    openAccessLinks: undefined,
    fulfillmentLinks: undefined,
    allBorrowLinks: [
      {
        url: "/epub-borrow-link",
        type: "application/atom+xml;type=entry;profile=opds-catalog",
        indirectType: "application/vnd.adobe.adept+xml"
      },
      {
        indirectType: "application/vnd.librarysimplified.axisnow+json",
        type: "application/atom+xml;type=entry;profile=opds-catalog",
        url: "/axis-borrow-link"
      }
    ],
    availability: {
      status: "ready",
      until: "2020-06-16"
    }
  });

  test("correct title and subtitle", () => {
    const utils = render(
      <FulfillmentCard book={readyBookWithTwoBorrowLinks} />
    );
    expect(
      utils.getByText("You can now borrow this book!")
    ).toBeInTheDocument();
    expect(utils.getByText("Your hold will expire on Tue Jun 16 2020."));
  });

  test("displays borrow button which calls updateBook", async () => {
    const updateBookSpy = jest.spyOn(actions, "updateBook");

    const utils = render(
      <FulfillmentCard book={readyBookWithTwoBorrowLinks} />,
      {
        initialState: merge<State>(fixtures.initialState, {
          loans: {
            url: "/loans-url",
            books: []
          }
        })
      }
    );
    // click borrow
    userEvent.click(utils.getByText("Borrow to read online"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("/axis-borrow-link");

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
  });

  test("shows loading state on one of the buttons when borrowing", async () => {
    //This gets called once for setup, once for the borrow button
    const _useBorrowSpy = jest
      .spyOn(useBorrow, "default")
      .mockReturnValueOnce(loadingBorrowState);

    const utils = render(
      <FulfillmentCard book={readyBookWithTwoBorrowLinks} />,
      {
        initialState: merge<State>(fixtures.initialState, {
          loans: {
            url: "/loans-url",
            books: []
          }
        })
      }
    );

    // One button says "Borrowing..."
    const borrowButton = await utils.findByRole("button", {
      name: /Loading Label/i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    const unClickedBorrowButton = await utils.getByText(
      "Borrow to read online"
    );
    expect(unClickedBorrowButton).toBeInTheDocument();
  });

  test("doesn't refetch loans after borrowing", async () => {
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const _updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementationOnce(_url => _dispatch =>
        new Promise(resolve => resolve(fixtures.book))
      );
    const utils = render(
      <FulfillmentCard book={readyBookWithTwoBorrowLinks} />,
      {
        initialState: merge<State>(fixtures.initialState, {
          loans: {
            url: "/loans-url",
            books: []
          }
        })
      }
    );
    userEvent.click(utils.getByText("Borrow to read online"));
    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
    expect(fetchLoansSpy).toHaveBeenCalledTimes(0);
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
    const reserveButton = utils.getByRole("button", {
      name: /Reserve/i
    });
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

  test("shows reserve button which calls updateBook", async () => {
    const updateBookSpy = jest.spyOn(actions, "updateBook");
    const utils = render(<FulfillmentCard book={unavailableBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(utils.getByText("Reserve"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("/epub-borrow-link");

    // the reserve button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Reserving..."));
  });
  test("shows loading state when reserving", async () => {
    const _useBorrowSpy = jest
      .spyOn(useBorrow, "default")
      .mockReturnValueOnce(loadingBorrowState);

    const utils = render(<FulfillmentCard book={unavailableBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    const reserveButton = utils.getByRole("button", {
      name: /Loading Label/i
    });

    expect(_useBorrowSpy).toHaveBeenCalledTimes(1);

    expect(reserveButton).toBeInTheDocument();
    expect(reserveButton).toHaveAttribute("disabled", "");
  });
  test("doesn't refetch loans after reserving", async () => {
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const _updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementationOnce(_url => _dispatch =>
        new Promise(resolve => resolve(fixtures.book))
      );
    const utils = render(<FulfillmentCard book={unavailableBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    userEvent.click(utils.getByText("Reserve"));
    expect(fetchLoansSpy).toHaveBeenCalledTimes(0);
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
    const reserveButton = utils.getByRole("button", { name: "Reserved" });
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
  beforeEach(() => ((env.NEXT_PUBLIC_COMPANION_APP as string) = "simplye"));

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

  const viewableAxisNowBook = mergeBook({
    openAccessLinks: undefined,
    fulfillmentLinks: [
      {
        url: "/epub-link",
        type: "application/vnd.librarysimplified.axisnow+json",
        indirectType: "something-indirect"
      }
    ],
    availability: {
      status: "available",
      until: "2020-06-18"
    }
  });

  test("constructs link to viewer for OpenAxis Books", () => {
    (env.NEXT_PUBLIC_COMPANION_APP as string) = "openebooks";
    (env.NEXT_PUBLIC_AXIS_NOW_DECRYPT as boolean) = true;
    const utils = render(<FulfillmentCard book={viewableAxisNowBook} />);
    const readerLink = utils.getByRole("link", {
      name: /Read Online/i
    }) as HTMLLinkElement;
    expect(readerLink.href).toBe("http://test-domain.com/read/%2Fepub-link");
  });

  test("correct title and subtitle", () => {
    const utils = render(<FulfillmentCard book={downloadableBook} />);
    expect(
      utils.getByText("You have this book on loan until Thu Jun 18 2020.")
    ).toBeInTheDocument();
    expect(utils.getByText("You're ready to read this book in SimplyE!"));
  });

  test("correct title and subtitle when COMPANION_APP is set to openebooks", () => {
    (env.NEXT_PUBLIC_COMPANION_APP as string) = "openebooks";
    const utils = render(<FulfillmentCard book={downloadableBook} />);
    expect(
      utils.getByText("You have this book on loan until Thu Jun 18 2020.")
    ).toBeInTheDocument();
    expect(
      utils.getByText("You're ready to read this book in Open eBooks!")
    ).toBeInTheDocument();
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

  test("download button calls indirect fullfill when book is indirect with a type that is readable online", () => {
    const bookWithIndirect = mergeBook({
      ...downloadableBook,
      fulfillmentLinks: [
        {
          url: "/indirect",
          type: "application/atom+xml;type=entry;profile=opds-catalog",
          indirectType:
            'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"'
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
      "/indirect",
      'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"'
    );
  });

  test("download button says download type when book is indirect with a type that is not readable online", () => {
    const bookWithIndirect = mergeBook({
      ...downloadableBook,
      fulfillmentLinks: [
        {
          url: "/indirect",
          type: "application/atom+xml;type=entry;profile=opds-catalog",
          indirectType: "indirect-link"
        }
      ]
    });

    const fulfillBookSpy = jest.spyOn(actions, "fulfillBook");

    const utils = render(<FulfillmentCard book={bookWithIndirect} />);
    const downloadButton = utils.getByText("Download atom");
    expect(downloadButton).toBeInTheDocument();

    userEvent.click(downloadButton);

    expect(fulfillBookSpy).toHaveBeenCalledTimes(1);
    expect(fulfillBookSpy).toHaveBeenCalledWith("/indirect");
  });

  test("says read online for streaming media", () => {
    const bookWithIndirect = mergeBook({
      ...downloadableBook,
      fulfillmentLinks: [
        {
          url: "/streaming",
          type: "application/atom+xml;type=entry;profile=opds-catalog",
          indirectType:
            'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"'
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
      'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"'
    );
  });

  test("does not show download links for audiobooks", () => {
    const audiobook = mergeBook({
      raw: {
        $: {
          "schema:additionalType": {
            value: "http://bib.schema.org/Audiobook"
          }
        }
      }
    });

    const utils = render(<FulfillmentCard book={audiobook} />);

    expect(
      utils.queryByText("If you would rather read on your computer, you can:")
    ).toBeNull();

    expect(utils.queryByText(/Download/i)).toBeNull();
  });
});
