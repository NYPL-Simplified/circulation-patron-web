import * as React from "react";
import { render, fixtures } from "../../test-utils";
import BreadcrumbBar from "../BreadcrumbBar";
import merge from "deepmerge";
import { State } from "opds-web-client/lib/state";
import { CollectionData } from "opds-web-client/lib/interfaces";
import computeBreadcrumbs from "../../computeBreadcrumbs";

const collectionData: CollectionData = {
  id: "id",
  url: "url",
  title: "title",
  lanes: [],
  books: [],
  navigationLinks: [],
  catalogRootLink: {
    url: "/root-url/",
    text: "root link"
  }
};

const stateWithCrumbs: State = merge(fixtures.initialState, {
  collection: {
    data: collectionData
  }
});

const breadcrumbs = [
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

/**
 * We mock out the computeBreadcrumbs function because I don't really understand
 * how that works, it is coming from OPDS anyways and I can't set up the state properly
 * to display what we actually want. Plus that was already externally tested.
 */
jest.mock("../../computeBreadcrumbs");
const mockedComputeBreadcrumbs = computeBreadcrumbs as jest.MockedFunction<
  typeof computeBreadcrumbs
>;

test("shows clicklable breadcrumbs", () => {
  // we have to spread this because the Breadcrumb bar mutates the return value,
  // which would leak across tests
  mockedComputeBreadcrumbs.mockReturnValueOnce([...breadcrumbs]);

  const utils = render(<BreadcrumbBar />, {
    initialState: stateWithCrumbs
  });

  const allBooks = utils.getByText("All Books");
  expect(allBooks.closest("a")).toHaveAttribute(
    "href",
    "/collection/url-allbooks"
  );

  const libraryCrumb = utils.getByText("lib");
  expect(libraryCrumb.closest("a")).toHaveAttribute(
    "href",
    "/collection/url-lib"
  );

  // the last item isn't a link
  const lastItem = utils.getByText("Last Item");
  expect(lastItem.closest("a")).toBeNull();
});

test("adds current location", () => {
  mockedComputeBreadcrumbs.mockReturnValueOnce([...breadcrumbs]);

  const utils = render(<BreadcrumbBar currentLocation="We are here" />, {
    initialState: stateWithCrumbs
  });

  const lastItem = utils.getByText("Last Item");
  expect(lastItem.closest("a")).toHaveAttribute("href", "/collection/last-url");

  const currentLoc = utils.getByText("We are here");
  expect(currentLoc.closest("a")).toBeNull();
});

test("renders children", () => {
  mockedComputeBreadcrumbs.mockReturnValueOnce([...breadcrumbs]);

  const utils = render(
    <BreadcrumbBar>
      <div>Hi Im here</div>
    </BreadcrumbBar>,
    {
      initialState: stateWithCrumbs
    }
  );
  expect(utils.getByText("Hi Im here")).toBeInTheDocument();
});
