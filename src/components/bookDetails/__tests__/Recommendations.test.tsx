import * as React from "react";
import { render, fixtures, actions, waitFor } from "../../../test-utils";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { RecommendationsStateContext } from "../../context/RecommendationsContext";
import Recommendations from "../Recommendations";
import { RecommendationsState } from "../../../interfaces";

const renderWithRecState = (
  children: React.ReactNode,
  recState: RecommendationsState = fixtures.recommendationsState
) =>
  render(
    <RecommendationsStateContext.Provider
      value={{
        ...recState
      }}
    >
      {children}
    </RecommendationsStateContext.Provider>
  );

/**
 * We need to mock actions.fetchCollection so that it doesn't actually call fetch.
 * We don't want to test actions right now
 */
const mockFetchCollection = jest
  .spyOn(actions, "fetchCollection")
  .mockImplementation(() => () => Promise.resolve({} as CollectionData));

test("shows recommendations loading state", async () => {
  /**
   * wrap the BookDetails in a Provider so we can specify the recommendations state.
   * This will override the provider rendered in our custom `render` method
   */
  const utils = renderWithRecState(<Recommendations book={fixtures.book} />, {
    ...fixtures.emptyRecommendationsState,
    isFetching: true
  });
  await waitFor(() =>
    expect(utils.getByText("Loading...")).toBeInTheDocument()
  );
});

test("fetches the proper url for recommendation collection", () => {
  render(<Recommendations book={fixtures.book} />);
  expect(mockFetchCollection).toHaveBeenCalledTimes(1);
  expect(mockFetchCollection).toHaveBeenCalledWith("/related-url");
});

test("shows recommendation lanes", () => {
  const utils = renderWithRecState(<Recommendations book={fixtures.book} />);
  expect(
    utils.getByRole("heading", { name: "Recommendations" })
  ).toBeInTheDocument();
  expect(
    utils.getByRole("heading", { name: "Jane Austen" })
  ).toBeInTheDocument();
});

test("doesn't show recommendations if there are none", () => {
  const utils = renderWithRecState(<Recommendations book={fixtures.book} />, {
    ...fixtures.emptyRecommendationsState
  });
  expect(utils.container).toBeEmptyDOMElement();
});

test("recommendations are clickable", () => {
  const utils = renderWithRecState(<Recommendations book={fixtures.book} />);

  const recommendationCover = utils.getByRole("link", {
    name: "View Recommendation 1"
  });
  expect(recommendationCover.closest("a")).toHaveAttribute(
    "href",
    "/book/recommendation-1-url"
  );
});

test("displays a more button for recommendations", () => {
  const utils = renderWithRecState(<Recommendations book={fixtures.book} />);
  const moreButton = utils.getByText("See More");
  expect(moreButton).toHaveAttribute(
    "href",
    "/collection/works%2Fcontributor%2FJane%2520Austen%2Feng"
  );
});

const mockClearCollection = jest
  .spyOn(actions, "clearCollection")
  .mockImplementation(() => ({
    type: "clear-collection"
  }));

test("cleans up recommendations collection on unmount", () => {
  const utils = renderWithRecState(<Recommendations book={fixtures.book} />);
  expect(mockClearCollection).toHaveBeenCalledTimes(0);
  utils.unmount();
  expect(mockClearCollection).toHaveBeenCalledTimes(1);
});

test("shows multiple lanes if existing", () => {
  const stateWithMultipleLames: RecommendationsState = {
    ...fixtures.emptyRecommendationsState,
    data: {
      id: "related-id",
      title: "related title",
      url: "data-related-url",
      books: [],
      navigationLinks: [],
      lanes: [
        {
          title: "lane 1",
          url: "/lane-1",
          books: fixtures.makeBooks(10)
        },
        {
          title: "lane 2",
          url: "/lane-2",
          books: fixtures.makeBooks(10)
        }
      ]
    }
  };
  const utils = renderWithRecState(
    <Recommendations book={fixtures.book} />,
    stateWithMultipleLames
  );

  expect(utils.getByText("lane 1")).toBeInTheDocument();
  expect(utils.getByText("lane 2")).toBeInTheDocument();

  expect(utils.getAllByText("See More")).toHaveLength(2);
});
