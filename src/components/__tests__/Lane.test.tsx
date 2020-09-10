import * as React from "react";
import { render, fixtures } from "../../test-utils";
import Lane from "../Lane";
import { LaneData } from "opds-web-client/lib/interfaces";
/**
 * Lane

 *
 *  Jsdom does not support anything to do with layout, which severely limits
 *  our ability to test this component. The right and left buttons won't work
 *  because the code believes you are at the scroll end (scrollLeft === scrollWidth - offsetWidth),
 *  because jsdom sets all those variables to 0.
 *
 *  We could try to mock those variables somehow, but our better bet is to test this component
 *  with cypress, which will render it in an actual browser and do layout.
 *  This is what we can't effectively test:
 *    - Click right
 *    - click left
 *    - does nothing when at ends
 *    - free scroll right then click should snap to
 *    - free scroll left then click should snap to
 *  which is the most important functionality.
 */

beforeEach(() => {
  jest.useFakeTimers();
});

const laneData: LaneData = {
  title: "my lane",
  url: "/link-to-lane",
  books: fixtures.makeBooks(4)
};

test("Renders", () => {
  const utils = render(<Lane lane={laneData} />);
  const book1 = utils.getByText("Book Title 1");
  expect(book1).toBeInTheDocument();
});

test("renders breadcrumbs with 0 books", () => {
  const withNoBooks = {
    ...laneData,
    books: []
  };
  const utils = render(<Lane lane={withNoBooks} />);

  // it should just show the breadcrumb
  const breadcrumb = utils.getByText("my lane");
  expect(breadcrumb).toBeInTheDocument();

  // there should be no li elements
  expect(utils.getByTestId("lane-list")).toBeEmptyDOMElement();
});

test("filters books", () => {
  const utils = render(
    <Lane lane={laneData} omitIds={["Book Id 1", "Book Id 2"]} />
  );

  expect(utils.queryByText("Book Title 1")).toBeNull();
  expect(utils.queryByText("Book Title 2")).toBeNull();

  expect(utils.getByText("Book Title 0")).toBeInTheDocument();
  expect(utils.getByText("Book Title 3")).toBeInTheDocument();
});

test("more button navigates to the right link", () => {
  const utils = render(<Lane lane={laneData} />);

  const moreButton = utils.getByText("See More").closest("a");

  expect(moreButton).toHaveAttribute("href", "/collection/link-to-lane");
});
