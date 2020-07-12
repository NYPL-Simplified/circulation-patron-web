import * as React from "react";
import { render, fixtures } from "../../test-utils";
import { Collection } from "../Collection";
import merge from "deepmerge";
import { State } from "opds-web-client/lib/state";
import { LaneData } from "opds-web-client/lib/interfaces";

const setCollectionAndBook = jest.fn().mockResolvedValue({});

beforeEach(() => {
  /**
   * We do this because Lane does use timeouts, so we need to be
   * sure they are mocked or we get nebulous errors
   */
  jest.useFakeTimers();
});

test("calls setCollectionAndBook", () => {
  render(<Collection setCollectionAndBook={setCollectionAndBook} />);

  expect(setCollectionAndBook).toHaveBeenCalledTimes(1);
});

test("displays loader", () => {
  const utils = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState: merge(fixtures.initialState, {
        collection: {
          isFetching: true
        }
      })
    }
  );
  expect(
    utils.getByRole("heading", { name: "Loading..." })
  ).toBeInTheDocument();
});

test("displays lanes when present", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBooks(10)
  };
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: [],
        lanes: [laneData]
      }
    }
  });
  const utils = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  // expect there to be a lane with books
  const laneTitle = utils.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
  expect(utils.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(
    utils.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

test("prefers lanes over books", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBooks(10)
  };
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: fixtures.makeBooks(10),
        lanes: [laneData]
      }
    }
  });
  const utils = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  // expect the lane title to be rendered, indicating it chose
  // lanes over books
  const laneTitle = utils.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
});

test("renders books in list view if no lanes", () => {
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: fixtures.makeBooks(10),
        lanes: null
      }
    }
  });
  const utils = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  const list = utils.getByTestId("listview-list");
  expect(list).toBeInTheDocument();
  expect(utils.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(
    utils.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

test("renders empty state if no lanes or books", () => {
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: [],
        lanes: null
      }
    }
  });
  const utils = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  expect(utils.getByText("This collection is empty.")).toBeInTheDocument();
});
