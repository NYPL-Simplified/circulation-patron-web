import * as React from "react";
import {
  render,
  fixtures,
  waitFor,
  waitForElementToBeRemoved,
  mockShowAuthModal
} from "test-utils";
import BorrowOrReserve from "components/BorrowOrReserve";
import userEvent from "@testing-library/user-event";
import * as fetch from "dataflow/opds1/fetch";
import { ServerError } from "errors";

test("shows correct button for borrowable book", () => {
  const utils = render(<BorrowOrReserve isBorrow url="/url" />);
  expect(utils.getByRole("button", { name: "Borrow" })).toBeInTheDocument();
});

test("shows reserve button for reservable book", () => {
  const utils = render(<BorrowOrReserve isBorrow={false} url="/url" />);
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
  mockedFetchBook.mockResolvedValueOnce(fixtures.fulfillableBook);
  const utils = render(<BorrowOrReserve isBorrow url="/url" />);

  const button = utils.getByRole("button", {
    name: "Borrow"
  });

  userEvent.click(button);

  // loading state
  const loading = utils.getByRole("button", { name: "Borrowing..." });
  expect(loading).toBeInTheDocument();

  // calls borrow
  expect(mockedFetchBook).toHaveBeenCalledTimes(1);
  expect(mockedFetchBook).toHaveBeenCalledWith(
    "/url",
    "http://test-cm.com/catalogUrl",
    "user-token"
  );

  await waitForElementToBeRemoved(() => utils.getByText("Borrowing..."));
});

test("shows auth form and error when not logged in", () => {
  const utils = render(<BorrowOrReserve isBorrow url="/url" />, {
    user: { isAuthenticated: false, token: undefined }
  });

  const button = utils.getByRole("button", {
    name: "Borrow"
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
  const utils = render(<BorrowOrReserve isBorrow url="/url" />);
  const button = utils.getByRole("button", {
    name: "Borrow"
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
    expect(utils.getByRole("button", { name: "Borrow" })).toBeInTheDocument();
  });
});

test("catches unrecognized fetch errors", async () => {
  const utils = render(<BorrowOrReserve isBorrow url="/url" />);
  const button = utils.getByRole("button", {
    name: "Borrow"
  });

  mockedFetchBook.mockRejectedValueOnce(new Error("You messed up!"));

  userEvent.click(button);

  // shows the error, button resets.
  await waitFor(() => {
    expect(
      utils.getByText("Error: An unknown error occurred.")
    ).toBeInTheDocument();
    expect(utils.queryByText("Borrowing...")).not.toBeInTheDocument();
    expect(utils.getByRole("button", { name: "Borrow" })).toBeInTheDocument();
  });
});

test("calls set book after borrowing", async () => {
  const utils = render(<BorrowOrReserve isBorrow url="/url" />);
  const button = utils.getByRole("button", {
    name: "Borrow"
  });

  mockedFetchBook.mockResolvedValueOnce(fixtures.fulfillableBook);
  expect(fixtures.mockSetBook).toHaveBeenCalledTimes(0);

  userEvent.click(button);

  await waitFor(() => expect(fixtures.mockSetBook).toHaveBeenCalledTimes(1));
});
