import * as React from "react";
import { render, fixtures, fireEvent } from "test-utils";
import { MyBooks } from "../MyBooks";
import { FulfillableBook } from "interfaces";

test("shows message and button when not authenticated", () => {
  const utils = render(<MyBooks />);

  expect(
    utils.getByText("You need to be signed in to view this page.")
  ).toBeInTheDocument();
});
test("displays empty state when empty and signed in", async () => {
  const utils = render(<MyBooks />, {
    user: {
      isAuthenticated: true,
      loans: undefined,
      isLoading: false
    }
  });

  expect(
    utils.queryByText("You need to be signed in to view this page.")
  ).not.toBeInTheDocument();

  expect(
    utils.getByText(
      "Your books will show up here when you have any loaned or on hold."
    )
  ).toBeInTheDocument();

  expect(utils.getByText("Sign Out")).toBeInTheDocument();
});

test("sign out calls sign out", async () => {
  const utils = render(<MyBooks />, {
    user: {
      isAuthenticated: true,
      loans: undefined,
      isLoading: false
    }
  });

  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(0);
  const signOut = await utils.findByRole("button", { name: "Sign Out" });
  fireEvent.click(signOut);

  // now get the confirmation button
  const realSignOut = utils.getByLabelText("Confirm Sign Out");
  fireEvent.click(realSignOut);

  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(1);
});

const books: FulfillableBook[] = [
  ...fixtures.makeFulfillableBooks(10),
  fixtures.mergeBook<FulfillableBook>({
    status: "fulfillable",
    fulfillmentLinks: [fixtures.fulfillmentLink],
    revokeUrl: "/revoke-10",
    id: "book 10",
    title: "Book Title 10",
    availability: {
      until: "Jan 2 2020",
      status: "available"
    }
  }),
  fixtures.mergeBook<FulfillableBook>({
    status: "fulfillable",
    fulfillmentLinks: [fixtures.fulfillmentLink],
    revokeUrl: "/revoke-11",
    id: "book 11",
    title: "Book Title 11",
    availability: {
      until: "Jan 1 2020",
      status: "available"
    }
  })
];

test("displays books when signed in with data", async () => {
  const utils = render(<MyBooks />, {
    user: {
      isAuthenticated: true,
      loans: books,
      isLoading: false
    }
  });

  expect(utils.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(utils.getByText(fixtures.makeBook(9).title)).toBeInTheDocument();

  expect(
    utils.queryByText("You need to be signed in to view this page.")
  ).not.toBeInTheDocument();

  expect(
    utils.queryByText(
      "Your books will show up here when you have any loaned or on hold."
    )
  ).toBeFalsy();

  expect(utils.getByText("Book 0 author")).toBeInTheDocument();
});

test("sorts books", () => {
  const utils = render(<MyBooks />, {
    user: {
      isAuthenticated: true,
      loans: books,
      isLoading: false
    }
  });
  const bookNames = utils.queryAllByText(/Book Title/);
  expect(bookNames[0]).toHaveTextContent("Book Title 11");
  expect(bookNames[1]).toHaveTextContent("Book Title 10");
});
