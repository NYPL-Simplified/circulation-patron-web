import * as React from "react";
import { render } from "test-utils";
import ListFilters from "../ListFilters";
import { CollectionData, FacetGroupData } from "interfaces";
import userEvent from "@testing-library/user-event";
import mockedRouter from "test-utils/mockNextRouter";

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
