import * as React from "react";
import { render, fixtures, fireEvent } from "test-utils";
import { MyBooks } from "../MyBooks";
import { BookData } from "interfaces";
import mockUser from "test-utils/mockUser";

test("shows message and button when not authenticated", () => {
  const utils = render(<MyBooks />);

  expect(
    utils.getByText("You need to be signed in to view this page.")
  ).toBeInTheDocument();
});
test("displays empty state when empty and signed in", async () => {
  mockUser({
    isAuthenticated: true,
    loans: undefined,
    isLoading: false
  });

  const utils = render(<MyBooks />);

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

test("sign out shows sign out modal", async () => {
  mockUser({
    isAuthenticated: true,
    loans: undefined,
    isLoading: false,
    signOut: jest.fn()
  });

  const utils = render(<MyBooks />);

  const signOut = await utils.findByRole("button", { name: "Sign Out" });
  fireEvent.click(signOut);
});

const books: BookData[] = [
  ...fixtures.makeBooks(10),
  fixtures.mergeBook({
    id: "book 10",
    title: "Book Title 10",
    availability: {
      until: "Jan 2 2020",
      status: "available"
    }
  }),
  fixtures.mergeBook({
    id: "book 11",
    title: "Book Title 11",
    availability: {
      until: "Jan 1 2020",
      status: "available"
    }
  })
];

test("displays books when signed in with data", async () => {
  mockUser({
    isAuthenticated: true,
    loans: books,
    isLoading: false
  });
  const utils = render(<MyBooks />);

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

  expect(
    utils.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

test("sorts books", () => {
  mockUser({
    isAuthenticated: true,
    loans: books,
    isLoading: false
  });

  const utils = render(<MyBooks />);
  const bookNames = utils.queryAllByText(/Book Title/);
  expect(bookNames[0]).toHaveTextContent("Book Title 11");
  expect(bookNames[1]).toHaveTextContent("Book Title 10");
});
