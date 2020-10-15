import * as React from "react";
import { render, fixtures } from "test-utils";
import { Collection } from "../Collection";
import { CollectionData, LaneData } from "interfaces";
import { makeSwrResponse, MockSwr } from "test-utils/mockSwr";
import { fetchCollection } from "dataflow/opds1/fetch";
import useSWR, { useSWRInfinite } from "swr";

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockedSWRInfinite = useSWRInfinite as jest.MockedFunction<
  typeof useSWRInfinite
>;

const defaultMock = makeSwrResponse({ data: fixtures.emptyCollection });
const mockSwr: MockSwr<CollectionData> = (value = defaultMock) => {
  mockedSWR.mockReturnValue(makeSwrResponse(value));
};

beforeEach(() => {
  /**
   * We do this because Lane does use timeouts, so we need to be
   * sure they are mocked or we get nebulous errors
   */
  jest.useFakeTimers();
});

test("calls swr to fetch collection", () => {
  mockSwr();
  render(<Collection />, {
    router: { query: { collectionUrl: "/collection" } }
  });

  expect(mockedSWR).toHaveBeenCalledTimes(1);
  expect(mockedSWR).toHaveBeenCalledWith("/collection", fetchCollection);
});

test("displays loader", () => {
  mockSwr({
    isValidating: true,
    data: undefined
  });
  const utils = render(<Collection />);
  expect(
    utils.getByRole("heading", { name: "Loading..." })
  ).toBeInTheDocument();
});

test("displays lanes when present", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBorrowableBooks(10)
  };
  mockSwr({
    data: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: [],
      lanes: [laneData]
    }
  });
  const utils = render(<Collection />);

  // expect there to be a lane with books
  const laneTitle = utils.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
  expect(utils.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(utils.getByText("Book 0 author")).toBeInTheDocument();
});

test("prefers lanes over books", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBorrowableBooks(10)
  };
  mockSwr({
    data: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: fixtures.makeBorrowableBooks(2),
      lanes: [laneData]
    }
  });
  const utils = render(<Collection />);

  // expect the lane title to be rendered, indicating it chose
  // lanes over books
  const laneTitle = utils.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
});

test("renders books in list view if no lanes", () => {
  mockSwr({
    isValidating: false,
    data: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: fixtures.makeBorrowableBooks(2),
      lanes: []
    }
  });
  mockedSWRInfinite.mockReturnValue({
    data: [{ books: fixtures.makeBorrowableBooks(2) }],
    isValidating: false
  } as any);
  const utils = render(<Collection />);

  const list = utils.getByTestId("listview-list");
  expect(list).toBeInTheDocument();
});

test("renders empty state if no lanes or books", () => {
  mockSwr({
    isValidating: false,
    data: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: [],
      lanes: []
    }
  });
  const utils = render(<Collection />);

  expect(utils.getByText("This collection is empty.")).toBeInTheDocument();
});
