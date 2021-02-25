import * as React from "react";
import { render, fixtures } from "test-utils";
import { Collection } from "../Collection";
import { CollectionData, LaneData } from "interfaces";
import { makeSwrResponse, MockSwr } from "test-utils/mockSwr";
import { fetchCollection } from "dataflow/opds1/fetch";
import useSWR, { useSWRInfinite } from "swr";
import "test-utils/mockScrollTo";
import { BreadcrumbContext } from "components/context/BreadcrumbContext";

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

  expect(mockedSWR).toHaveBeenCalledWith(
    ["/collection", "user-token"],
    fetchCollection
  );
});

test("displays loader", () => {
  mockSwr({
    isValidating: true,
    data: undefined
  });
  const utils = render(<Collection />, {
    router: { query: { collectionUrl: "/collection" } }
  });
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
      lanes: [laneData],
      searchDataUrl: "/search-data-url"
    }
  });
  const utils = render(<Collection />, {
    router: { query: { collectionUrl: "/collection" } }
  });

  // expect there to be a lane with books
  const laneTitle = utils.getByRole("heading", { name: "Lane Title" });
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
      lanes: [laneData],
      searchDataUrl: "/search-data-url"
    }
  });
  const utils = render(<Collection />, {
    router: { query: { collectionUrl: "/collection" } }
  });

  // expect the lane title to be rendered, indicating it chose
  // lanes over books
  const laneTitle = utils.getByRole("heading", { name: "Lane Title" });
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
      lanes: [],
      searchDataUrl: "/search-data-url"
    }
  });
  mockedSWRInfinite.mockReturnValue({
    data: [{ books: fixtures.makeBorrowableBooks(2) }],
    isValidating: false
  } as any);
  const utils = render(<Collection />, {
    router: { query: { collectionUrl: "/collection" } }
  });

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
      lanes: [],
      searchDataUrl: "/search-data-url"
    }
  });
  const utils = render(<Collection />, {
    router: { query: { collectionUrl: "/collection" } }
  });

  expect(utils.getByText("This collection is empty.")).toBeInTheDocument();
});

describe("breadcrumbs", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBorrowableBooks(1)
  };
  // the breadcrumbs are currently extracted from "raw". This
  // is from legacy code and should be changed in the future to
  // extract them during parsing into the typed Collection object.
  const raw = {
    "simplified:breadcrumbs": [
      {
        link: [
          {
            $: {
              href: { value: "breadcrumb-url" },
              title: { value: "breadcrumb title" }
            }
          },
          {
            $: {
              href: { value: "breadcrumb-url-2" },
              title: { value: "breadcrumb title 2" }
            }
          }
        ]
      }
    ]
  };
  const responseWithBreadcrumbs = {
    data: {
      id: "id",
      url: "url",
      title: "title",
      navigationLinks: [],
      books: [],
      lanes: [laneData],
      searchDataUrl: "/search-data-url",
      raw: raw
    }
  };

  test("collection view properly shows breadcrumbs from the collection", () => {
    mockSwr(responseWithBreadcrumbs);
    const utils = render(<Collection />, {
      router: { query: { collectionUrl: "/collection" } }
    });

    // make sure the breadcrumbs display what you expect from the collection here
    expect(
      utils.getByRole("link", { name: "breadcrumb title" })
    ).toHaveAttribute("href", "/testlib/collection/breadcrumb-url");
    expect(
      utils.getByRole("link", { name: "breadcrumb title 2" })
    ).toHaveAttribute("href", "/testlib/collection/breadcrumb-url-2");
  });

  test("collection sets its breadcrumbs in BreadcrumbsContext", () => {
    mockSwr(responseWithBreadcrumbs);

    // we use the BreadcrumbsContext.Provider to pass in a custom value
    // with a mocked setStoredBreadcrumbs
    const mockSetBreadcrumbs = jest.fn();
    render(
      <BreadcrumbContext.Provider
        value={{
          setStoredBreadcrumbs: mockSetBreadcrumbs,
          storedBreadcrumbs: []
        }}
      >
        <Collection />
      </BreadcrumbContext.Provider>,
      {
        router: { query: { collectionUrl: "/collection" } }
      }
    );
    expect(mockSetBreadcrumbs).toHaveBeenCalledWith([
      { text: "breadcrumb title", url: "breadcrumb-url" },
      { text: "breadcrumb title 2", url: "breadcrumb-url-2" },
      { text: "title", url: "url" }
    ]);
  });
});
