import * as React from "react";
import {
  render,
  fixtures,
  waitFor,
  waitForElementToBeRemoved,
  mockShowAuthModal
} from "test-utils";
import BorrowOrReserve from "components/BorrowOrReserve";
import { MediaLink } from "interfaces";
import userEvent from "@testing-library/user-event";
import * as fetch from "dataflow/opds1/fetch";
import { ServerError } from "errors";

const borrowLink: MediaLink = {
  url: "/epub-borrow-link",
  type: "application/atom+xml;type=entry;profile=opds-catalog"
};
test("shows correct button for borrowable book", () => {
  const utils = render(
    <BorrowOrReserve book={fixtures.book} isBorrow borrowLink={borrowLink} />
  );
  expect(
    utils.getByRole("button", { name: "Borrow to read on a mobile device" })
  ).toBeInTheDocument();
});

test("shows correct button for axisnow borrowable book", () => {
  const axisnow: MediaLink = {
    url: "/epub-borrow-link",
    type: "application/atom+xml;type=entry;profile=opds-catalog",
    indirectType: "application/vnd.librarysimplified.axisnow+json"
  };
  const utils = render(
    <BorrowOrReserve book={fixtures.book} isBorrow borrowLink={axisnow} />
  );
  expect(
    utils.getByRole("button", { name: "Borrow to read online" })
  ).toBeInTheDocument();
});

test("shows reserve button for reservable book", () => {
  const utils = render(
    <BorrowOrReserve
      book={fixtures.book}
      isBorrow={false}
      borrowLink={borrowLink}
    />
  );
  expect(utils.getByRole("button", { name: "Reserve" })).toBeInTheDocument();
});

/**
 * Some mock utilites for the next tests
 */
(fetch as any).fetchCollection = jest.fn();
(fetch as any).fetchBook = jest.fn();
const mockedFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

test("borrowing calls correct url with token", async () => {
  mockedFetchBook.mockResolvedValueOnce(fixtures.book);
  const utils = render(
    <BorrowOrReserve book={fixtures.book} isBorrow borrowLink={borrowLink} />
  );

  const button = utils.getByRole("button", {
    name: "Borrow to read on a mobile device"
  });

  userEvent.click(button);

  // loading state
  const loading = utils.getByRole("button", { name: "Borrowing..." });
  expect(loading).toBeInTheDocument();

  // calls borrow
  expect(mockedFetchBook).toHaveBeenCalledTimes(1);
  expect(mockedFetchBook).toHaveBeenCalledWith(
    "/epub-borrow-link",
    "http://test-cm.com/catalogUrl",
    "user-token"
  );

  await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
});

test("shows auth form and error when not logged in", () => {
  const utils = render(
    <BorrowOrReserve book={fixtures.book} isBorrow borrowLink={borrowLink} />,
    {
      user: { isAuthenticated: false, token: undefined }
    }
  );

  const button = utils.getByRole("button", {
    name: "Borrow to read on a mobile device"
  });
  expect(mockShowAuthModal).toHaveBeenCalledTimes(0);

  userEvent.click(button);

  // no loading state
  expect(utils.queryByText("Borrowing...")).not.toBeInTheDocument();

  // error is there
  expect(
    utils.getByText("Error: You must be signed in to borrow this book.")
  ).toBeInTheDocument();

  // doesn't call the borrow book
  expect(mockedFetchBook).not.toHaveBeenCalled();

  // shows auth modal
  expect(mockShowAuthModal).toHaveBeenCalledTimes(1);
});

test("catches and displays server errors", async () => {
  const utils = render(
    <BorrowOrReserve book={fixtures.book} isBorrow borrowLink={borrowLink} />
  );
  const button = utils.getByRole("button", {
    name: "Borrow to read on a mobile device"
  });

  mockedFetchBook.mockRejectedValueOnce(
    new ServerError("/fetched-url", 500, {
      detail: "Something happened on the server",
      status: 500,
      title: "Server goofed"
    })
  );

  userEvent.click(button);

  // shows the error, button resets.
  await waitFor(() => {
    expect(
      utils.getByText("Error: Something happened on the server")
    ).toBeInTheDocument();
    expect(utils.queryByText("Borrowing...")).not.toBeInTheDocument();
    expect(
      utils.getByRole("button", { name: "Borrow to read on a mobile device" })
    ).toBeInTheDocument();
  });
});

test("catches unrecognized fetch errors", async () => {
  const utils = render(
    <BorrowOrReserve book={fixtures.book} isBorrow borrowLink={borrowLink} />
  );
  const button = utils.getByRole("button", {
    name: "Borrow to read on a mobile device"
  });

  mockedFetchBook.mockRejectedValueOnce(new Error("You messed up!"));

  userEvent.click(button);

  // shows the error, button resets.
  await waitFor(() => {
    expect(
      utils.getByText("Error: An error occurred while borrowing this book.")
    ).toBeInTheDocument();
    expect(utils.queryByText("Borrowing...")).not.toBeInTheDocument();
    expect(
      utils.getByRole("button", { name: "Borrow to read on a mobile device" })
    ).toBeInTheDocument();
  });
});

test("calls set book after borrowing", async () => {
  const utils = render(
    <BorrowOrReserve book={fixtures.book} isBorrow borrowLink={borrowLink} />
  );
  const button = utils.getByRole("button", {
    name: "Borrow to read on a mobile device"
  });

  mockedFetchBook.mockResolvedValueOnce(fixtures.book);
  expect(fixtures.mockSetBook).toHaveBeenCalledTimes(0);

  userEvent.click(button);

  await waitFor(() => expect(fixtures.mockSetBook).toHaveBeenCalledTimes(1));
});
