import * as React from "react";
import { fixtures, render } from "test-utils";
import ListFilters from "../ListFilters";
import { CollectionData, FacetGroupData } from "interfaces";
import userEvent from "@testing-library/user-event";
import mockedRouter, { mockPush } from "test-utils/mockNextRouter";
import PageTitle from "components/PageTitle";

/**
 * Sort by
 *  - has the right options
 *  - does redirect
 */

const sortByFacet: FacetGroupData = {
  label: "Sort by",
  facets: [
    {
      label: "author",
      href: "http://author",
      active: true
    },
    {
      label: "title",
      href: "http://title",
      active: false
    }
  ]
};

const availabilityFacet: FacetGroupData = {
  label: "Availability",
  facets: [
    {
      label: "All",
      href: "http://all",
      active: true
    },
    {
      label: "Yours to keep",
      href: "http://yours-to-keep",
      active: false
    },
    {
      label: "Available now",
      href: "http://now",
      active: false
    }
  ]
};

const formatsFacet: FacetGroupData = {
  label: "Formats",
  facets: [
    {
      label: "eBooks",
      active: true,
      href: "http://ebooks"
    },
    {
      label: "Audiobooks",
      href: "http://audiobooks",
      active: false
    },
    {
      label: "All",
      href: "http://all",
      active: false
    }
  ]
};

const collectionWithFacets = (facets: FacetGroupData[]): CollectionData => ({
  id: "id",
  url: "url",
  title: "with facets",
  lanes: [],
  books: [],
  navigationLinks: [],
  facetGroups: facets
});

test("renders sort by select with correct options", () => {
  const utils = render(
    <ListFilters collection={collectionWithFacets([sortByFacet])} />
  );

  const facet = utils.getByLabelText("Sort by");
  expect(utils.getByText("author")).toBeInTheDocument();
  expect(utils.getByText("title")).toBeInTheDocument();

  expect(facet).toHaveValue("author");
});

test("renders availability select with correct options", () => {
  const utils = render(
    <ListFilters collection={collectionWithFacets([availabilityFacet])} />
  );

  const facet = utils.getByLabelText("Availability");
  expect(utils.getByText("All")).toBeInTheDocument();
  expect(utils.getByText("Yours to keep")).toBeInTheDocument();
  expect(utils.getByText("Available now")).toBeInTheDocument();

  expect(facet).toHaveValue("All");
});

test("does redirect when selected", () => {
  const utils = render(
    <ListFilters collection={collectionWithFacets([sortByFacet])} />
  );

  const facet = utils.getByLabelText("Sort by");

  userEvent.selectOptions(facet, "title");

  expect(mockedRouter.push).toHaveBeenCalledTimes(1);
  expect(mockedRouter.push).toHaveBeenCalledWith(
    "/testlib/collection/http%3A%2F%2Ftitle"
  );
});

test("renders all facets when present", () => {
  const utils = render(
    <ListFilters
      collection={collectionWithFacets([
        sortByFacet,
        availabilityFacet,
        formatsFacet
      ])}
    />
  );

  expect(utils.getByRole("combobox", { name: "Formats" })).toBeInTheDocument();
  expect(
    utils.getByRole("combobox", { name: "Availability" })
  ).toBeInTheDocument();
  expect(utils.getByRole("combobox", { name: "Sort by" })).toBeInTheDocument();
});

const collectionWithFormats: CollectionData = {
  facetGroups: [formatsFacet],
  title: "my lane",
  url: "/link-to-lane",
  id: "collection-id",
  books: [],
  navigationLinks: [],
  lanes: [
    {
      title: "my lane",
      url: "/link-to-lane",
      books: fixtures.makeBorrowableBooks(10)
    }
  ]
};

describe("Format filters", () => {
  test("Format filters not rendered when not in state", () => {
    const utils = render(<PageTitle>Child</PageTitle>);
    expect(utils.queryByLabelText("Format filters")).toBeFalsy();
    expect(utils.queryByText("All")).toBeFalsy();
    expect(utils.queryByLabelText("Books")).toBeFalsy();
    expect(utils.queryByLabelText("Audiobooks")).toBeFalsy();
  });
  test("Format filters are visible in PageTitle w/ facets", () => {
    const utils = render(
      <PageTitle collection={collectionWithFormats}>Child</PageTitle>
    );
    expect(utils.getByRole("option", { name: "All" })).toBeTruthy();
    expect(utils.getByRole("option", { name: "eBooks" })).toBeTruthy();
    expect(utils.getByRole("option", { name: "Audiobooks" })).toBeTruthy();
  });

  test("format filters navigate to respective urls", async () => {
    const utils = render(
      <PageTitle collection={collectionWithFormats}>Child</PageTitle>
    );

    const select = utils.getByRole("combobox", {
      name: "Formats"
    }) as HTMLSelectElement;
    // all is selected
    expect(select.value).toBe("eBooks");

    // click works
    userEvent.selectOptions(select, "All");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      "/testlib/collection/http%3A%2F%2Fall"
    );
  });
});
