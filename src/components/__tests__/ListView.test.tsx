import * as React from "react";
import { render, fixtures, logRoles } from "../../test-utils";
import { ListView } from "../BookList";
import { useBreakpointIndex } from "@theme-ui/match-media";
import merge from "deepmerge";
import { BookData } from "opds-web-client/lib/interfaces";

const books = fixtures.makeBooks(3);

/**
 * We need mock the useBreakpointIndex function provided by theme-ui
 * because it uses browser globals not available to us in jsdom
 * ie, it relies on layout
 */
jest.mock("@theme-ui/match-media");
const mockeduseBreakpointsIndex = useBreakpointIndex as jest.MockedFunction<
  typeof useBreakpointIndex
>;
mockeduseBreakpointsIndex.mockReturnValue(1);

test("renders books", () => {
  const node = render(<ListView books={books} />);

  function expectBook(i: number) {
    const book = fixtures.makeBook(i);
    const bookNode = node.getByText(book.title);
    expect(bookNode).toBeInTheDocument();
    expect(bookNode?.closest("a")).toHaveAttribute("href", `/book${book.url}`);
    // shows details as well
    expect(node.getByText(book.authors[0])).toBeInTheDocument();
    expect(node.getByText(book.publisher)).toBeInTheDocument();
    expect(node.getByText(book.categories.join(", "))).toBeInTheDocument();
  }

  expectBook(0);
  expectBook(1);
  expectBook(2);
});

test("includes breadcrumb children", () => {
  const node = render(
    <ListView books={books} breadcrumb={<div>Hi from breadcrumb</div>} />
  );
  expect(node.getByText("Hi from breadcrumb")).toBeInTheDocument();
});

test("displays borrow button ", () => {
  const node = render(<ListView books={books} showBorrowButton />);
  const borrowButtons = node.getAllByText("Borrow");
  expect(borrowButtons).toHaveLength(3);
});

test("shows gallery on mobile instead of list", () => {
  mockeduseBreakpointsIndex.mockReturnValueOnce(0);
  const node = render(<ListView books={books} />);

  const list = node.getByTestId("gallery-list");

  expect(list).toHaveStyle("display: flex; flex-wrap: wrap;");
});

test("shows list not gallery on desktop", () => {
  const node = render(<ListView books={books} />);

  const list = node.getByTestId("listview-list");

  expect(list).toHaveStyle("display: block;");
});

test("truncates long titles", () => {
  const longBook = merge<BookData>(fixtures.book, {
    title: "This is an extremely long title it's really way too long"
  });
  const node = render(<ListView books={[longBook]} />);

  const title = node.getByText(/This is an extremely/i);
  expect(title.textContent).toHaveLength(50);
});

test("truncates authors", () => {
  const longBook = merge<BookData>(
    fixtures.book,
    {
      authors: ["one", "two", "three", "four", "five"]
    },
    {
      arrayMerge: (a, b) => b
    }
  );
  const node = render(<ListView books={[longBook]} />);

  expect(node.getByText("one, two"));
  expect(node.queryByText("one, two, three")).toBeFalsy();
});
