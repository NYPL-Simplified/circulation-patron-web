import * as React from "react";
import { render, fixtures } from "test-utils";
import { BookList, InfiniteBookList } from "../BookList";
import merge from "deepmerge";
import { BookData, CollectionData } from "interfaces";
import { useSWRInfinite } from "swr";
import { fetchCollection } from "dataflow/opds1/fetch";
import userEvent from "@testing-library/user-event";

const books = fixtures.makeBooks(3);

test("renders books", () => {
  const utils = render(<BookList books={books} />);

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
  const utils = render(<BookList books={[longBook]} />);

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
  const utils = render(<BookList books={[longBook]} />);

  expect(utils.getByText("one, two & 3 more"));
  expect(utils.queryByText("one, two, three")).toBeFalsy();
});

test("doesn't render book if it has no url", () => {
  const utils = render(
    <BookList
      books={[
        {
          ...fixtures.book,
          url: undefined
        }
      ]}
    />
  );
  expect(utils.queryByText("The Mayan Secrets")).not.toBeInTheDocument();
});

jest.mock("swr");
const useSWRInfiniteMock = useSWRInfinite as jest.MockedFunction<
  typeof useSWRInfinite
>;

function mockCollection(data?: CollectionData[]) {
  useSWRInfiniteMock.mockReturnValue({
    size: 0,
    setSize: jest.fn(),
    data: data
  } as any);
}

describe("infinite loading book list", () => {
  test("fetches collection", () => {
    mockCollection();
    render(<InfiniteBookList firstPageUrl="/first-page" />);

    expect(useSWRInfinite).toHaveBeenCalledWith(
      expect.anything(),
      fetchCollection
    );
  });

  test("properly extracts books from array of collections", () => {
    mockCollection([
      {
        ...fixtures.emptyCollection,
        books: fixtures.makeBooks(2)
      },
      {
        ...fixtures.emptyCollection,
        id: "id-2",
        books: [fixtures.book]
      }
    ]);
    const utils = render(<InfiniteBookList firstPageUrl="/first-page" />);

    expect(
      utils.getByRole("heading", { name: "Book Title 0" })
    ).toBeInTheDocument();
    expect(
      utils.getByRole("heading", { name: "Book Title 1" })
    ).toBeInTheDocument();
    expect(
      utils.getByRole("heading", { name: "The Mayan Secrets" })
    ).toBeInTheDocument();
  });

  test("shows loading indicator when fetching more", () => {
    const notFinalCollection: CollectionData = {
      books: [fixtures.book],
      id: "id!",
      lanes: [],
      navigationLinks: [],
      title: "last collection",
      url: "http://last.com",
      nextPageUrl: "http://next-page.com"
    };
    useSWRInfiniteMock.mockReturnValue({
      size: 2,
      setSize: jest.fn(),
      data: [notFinalCollection]
    } as any);
    const utils = render(<InfiniteBookList firstPageUrl="/first-page" />);

    expect(utils.getByText("Loading ...")).toBeInTheDocument();
  });

  test("doesn't show loader when at end of list", () => {
    const finalCollection: CollectionData = {
      books: [fixtures.book],
      id: "id!",
      lanes: [],
      navigationLinks: [],
      title: "last collection",
      url: "http://last.com"
      // no nextPageUrl
    };
    useSWRInfiniteMock.mockReturnValue({
      size: 2,
      setSize: jest.fn(),
      data: [finalCollection]
    } as any);

    const utils = render(
      <InfiniteBookList firstPageUrl="http://first-page.com" />
    );

    expect(utils.getByText("The Mayan Secrets")).toBeInTheDocument();

    expect(utils.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("shows view more button which loads more books on click", () => {
    const notFinalCollection: CollectionData = {
      books: [fixtures.book],
      id: "id!",
      lanes: [],
      navigationLinks: [],
      title: "last collection",
      url: "http://last.com",
      nextPageUrl: "http://next-page.com"
    };
    const mockSetSize = jest.fn();
    useSWRInfiniteMock.mockReturnValue({
      size: 1,
      setSize: mockSetSize,
      data: [notFinalCollection]
    } as any);
    const utils = render(<InfiniteBookList firstPageUrl="/first-page" />);

    const viewMore = utils.getByRole("button", {
      name: "View more"
    });

    expect(viewMore).toBeInTheDocument();

    // click it and you should fetch more
    expect(mockSetSize).toHaveBeenCalledTimes(0);
    userEvent.click(viewMore);
    expect(mockSetSize).toHaveBeenCalledTimes(1);
  });
});
