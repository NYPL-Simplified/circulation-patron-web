import * as React from "react";
import { render, fixtures, waitFor } from "test-utils";
import { CollectionData } from "interfaces";
import Recommendations from "../Recommendations";
import useSWR, { responseInterface } from "swr";
import { fetchCollection } from "dataflow/opds1/fetch";

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

function makeSwrResponse(
  value: Partial<responseInterface<CollectionData, any>>
) {
  return {
    data: undefined,
    error: undefined,
    revalidate: jest.fn(),
    isValidating: false,
    mutate: jest.fn(),
    ...value
  };
}
function mockSwr(
  value: Partial<responseInterface<CollectionData, any>> = {
    isValidating: false,
    data: fixtures.recommendations
  }
) {
  mockedSWR.mockReturnValue(makeSwrResponse(value));
}

test("shows recommendations loading state", async () => {
  /**
   * wrap the BookDetails in a Provider so we can specify the recommendations state.
   * This will override the provider rendered in our custom `render` method
   */
  mockSwr({
    data: undefined,
    isValidating: true
  });
  const utils = render(<Recommendations book={fixtures.borrowableBook} />);
  await waitFor(() =>
    expect(utils.getByText("Loading...")).toBeInTheDocument()
  );
});

test("fetches the proper url for recommendation collection", () => {
  render(<Recommendations book={fixtures.borrowableBook} />);
  expect(mockedSWR).toHaveBeenCalledTimes(1);
  expect(mockedSWR).toHaveBeenCalledWith("http://related-url", fetchCollection);
});

test("shows recommendation lanes", () => {
  mockSwr();
  const utils = render(<Recommendations book={fixtures.borrowableBook} />);
  expect(
    utils.getByRole("heading", { name: "Recommendations" })
  ).toBeInTheDocument();
  expect(
    utils.getByRole("heading", { name: "Jane Austen" })
  ).toBeInTheDocument();
});

test("doesn't show recommendations if there are none", () => {
  mockSwr({
    isValidating: false,
    data: undefined
  });
  const utils = render(<Recommendations book={fixtures.borrowableBook} />);
  expect(utils.container).toBeEmptyDOMElement();
});

test("recommendations are clickable", () => {
  mockSwr();
  const utils = render(<Recommendations book={fixtures.borrowableBook} />);

  const recommendationCover = utils.getByRole("link", {
    name: "View Recommendation 1"
  });
  expect(recommendationCover.closest("a")).toHaveAttribute(
    "href",
    "/testlib/book/http%3A%2F%2Frecommendation-1-url"
  );
});

test("displays a more button for recommendations", () => {
  mockSwr();
  const utils = render(<Recommendations book={fixtures.borrowableBook} />);
  const moreButton = utils.getByText("See More");
  expect(moreButton).toHaveAttribute(
    "href",
    "/testlib/collection/http%3A%2F%2Ftest-cm.com%2FcatalogUrl%2Fworks%2Fcontributor%2FJane%2520Austen%2Feng%2F"
  );
});

test("shows multiple lanes if existing", () => {
  const multipleLanes: CollectionData = {
    id: "related-id",
    title: "related title",
    url: "data-related-url",
    books: [],
    navigationLinks: [],
    lanes: [
      {
        title: "lane 1",
        url: "/lane-1",
        books: fixtures.makeBorrowableBooks(10)
      },
      {
        title: "lane 2",
        url: "/lane-2",
        books: fixtures.makeBorrowableBooks(10)
      }
    ]
  };
  mockSwr({
    isValidating: false,
    data: multipleLanes
  });
  const utils = render(<Recommendations book={fixtures.borrowableBook} />);

  expect(utils.getByText("lane 1")).toBeInTheDocument();
  expect(utils.getByText("lane 2")).toBeInTheDocument();

  expect(utils.getAllByText("See More")).toHaveLength(2);
});
