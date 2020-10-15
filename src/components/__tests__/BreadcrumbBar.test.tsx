import * as React from "react";
import { render } from "test-utils";
import BreadcrumbBar from "../BreadcrumbBar";

// we make this a function because the breadcrumbs bar pops the last
// item, which is a mutation that would leak across tests
const breadcrumbs = () => [
  {
    text: "All Books",
    url: "url-allbooks"
  },
  {
    url: "url-lib",
    text: "lib"
  },
  {
    url: "last-url",
    text: "Last Item"
  }
];

test("shows clicklable breadcrumbs", () => {
  const utils = render(<BreadcrumbBar breadcrumbs={breadcrumbs()} />);

  const allBooks = utils.getByText("All Books");
  expect(allBooks.closest("a")).toHaveAttribute(
    "href",
    "/testlib/collection/url-allbooks"
  );

  const libraryCrumb = utils.getByText("lib");
  expect(libraryCrumb.closest("a")).toHaveAttribute(
    "href",
    "/testlib/collection/url-lib"
  );

  // the last item isn't a link
  const lastItem = utils.getByText("Last Item");
  expect(lastItem.closest("a")).toBeNull();
});

test("adds current location", () => {
  const utils = render(
    <BreadcrumbBar breadcrumbs={breadcrumbs()} currentLocation="We are here" />
  );

  const lastItem = utils.getByText("Last Item");
  expect(lastItem.closest("a")).toHaveAttribute(
    "href",
    "/testlib/collection/last-url"
  );

  const currentLoc = utils.getByText("We are here");
  expect(currentLoc.closest("a")).toBeNull();
});

test("renders children", () => {
  const utils = render(
    <BreadcrumbBar>
      <div>Hi Im here</div>
    </BreadcrumbBar>
  );
  expect(utils.getByText("Hi Im here")).toBeInTheDocument();
});
