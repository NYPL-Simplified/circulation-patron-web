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
import userEvent from "@testing-library/user-event";
import _download from "downloadjs";
import * as env from "utils/env";
import { mockAuthenticated } from "test-utils/mockAuthState";
import mockUser from "test-utils/mockUser";

jest.mock("downloadjs");
window.open = jest.fn();

describe("open-access", () => {
  test("correct title and subtitle when not loaned", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      utils.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(utils.getByRole("button", { name: /Borrow/i })).toBeInTheDocument();
  });

  test("correct title and subtitle when loaned", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      utils.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(
      utils.getByText("You're ready to read this book in SimplyE!")
    ).toBeInTheDocument();
  });

  test("shows download options if loaned", () => {
    const utils = render(<FulfillmentCard book={fixtures.book} />);

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

    const utils = render(<FulfillmentCard book={fixtures.book} />);
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

  test("displays borrow button which fetches book when clicked", async () => {
    mockAuthenticated();
    mockUser();
    const utils = render(<FulfillmentCard book={closedAccessBook} />);
    const borrowButton = utils.getByText("Borrow to read on a mobile device");
    expect(borrowButton).toBeInTheDocument();

    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    // the first call is to loans in UserContext
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/epub-borrow-link", {
      headers: {
        Authorization: "user-token",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
    // there is an error because we didn't mock fetch to return something
    expect(
      utils.getByText("Error: An error occurred while borrowing this book.")
    );
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

  test("displays borrow button which fetches book when clicked", async () => {
    mockAuthenticated();
    mockUser();
    const utils = render(<FulfillmentCard book={readyBook} />);
    const borrowButton = utils.getByText("Borrow to read on a mobile device");
    expect(borrowButton).toBeInTheDocument();

    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    // the first call is to loans in UserContext
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/epub-borrow-link", {
      headers: {
        Authorization: "user-token",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
    // there is an error because we didn't mock fetch to return something
    expect(
      utils.getByText("Error: An error occurred while borrowing this book.")
    );
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

  test("displays borrow button which fetches book", async () => {
    mockAuthenticated();
    mockUser();
    const utils = render(
      <FulfillmentCard book={readyBookWithTwoBorrowLinks} />
    );
    const borrowButton = utils.getByText("Borrow to read on a mobile device");
    expect(borrowButton).toBeInTheDocument();

    // click borrow
    userEvent.click(utils.getByText("Borrow to read on a mobile device"));
    // the first call is to loans in UserContext
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/epub-borrow-link", {
      headers: {
        Authorization: "user-token",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
    // there is an error because we didn't mock fetch to return something
    expect(
      utils.getByText("Error: An error occurred while borrowing this book.")
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

  test("shows reserve button which fetches book", async () => {
    mockAuthenticated();
    mockUser();
    const utils = render(<FulfillmentCard book={unavailableBook} />);
    const reserveButton = utils.getByText("Reserve");
    expect(reserveButton).toBeInTheDocument();

    // click borrow
    userEvent.click(utils.getByText("Reserve"));
    // the first call is to loans in UserContext
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/epub-borrow-link", {
      headers: {
        Authorization: "user-token",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => utils.getByText("Reserving..."));
    // there is an error because we didn't mock fetch to return something
    expect(
      utils.getByText("Error: An error occurred while borrowing this book.")
    );
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
