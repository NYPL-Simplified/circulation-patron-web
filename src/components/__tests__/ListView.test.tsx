import * as React from "react";
import { render, fixtures } from "test-utils";
import { ListView } from "../BookList";
import merge from "deepmerge";
import { BookData } from "interfaces";
import useInfiniteScroll from "hooks/useInfiniteScroll";

const mockUseInfiniteScroll = useInfiniteScroll as jest.Mock<
  ReturnType<typeof useInfiniteScroll>
>;
jest.mock("hooks/useInfiniteScroll", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    isFetchingPage: false
  })
}));

const books = fixtures.makeBooks(3);

test("renders books", () => {
  const utils = render(<ListView books={books} />);

  function expectBook(i: number) {
    const book = fixtures.makeBook(i);
    expect(utils.getByText(book.title)).toBeInTheDocument();
    // shows details as well
    expect(utils.getByText(book.authors[0])).toBeInTheDocument();
  }

  expectBook(0);
  expectBook(1);
  expectBook(2);
});

test("truncates long titles", () => {
  const longBook = merge<BookData>(fixtures.book, {
    title: "This is an extremely long title it's really way too long"
  });
  const utils = render(<ListView books={[longBook]} />);

  const title = utils.getByText(/This is an extremely/i);
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
  const utils = render(<ListView books={[longBook]} />);

  expect(utils.getByText("one, two & 3 more"));
  expect(utils.queryByText("one, two, three")).toBeFalsy();
});

test("displays loader", () => {
  mockUseInfiniteScroll.mockReturnValueOnce({
    isFetchingPage: true,
    listRef: React.createRef()
  });
  const utils = render(<ListView books={[]} />);
  expect(utils.getByText("Loading more books...")).toBeInTheDocument();
});
