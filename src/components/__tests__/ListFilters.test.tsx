import * as React from "react";
import { render, fixtures } from "../../test-utils";
import ListFilters from "../ListFilters";
import merge from "deepmerge";
import { FacetGroupData } from "opds-web-client/lib/interfaces";
import { State } from "opds-web-client/lib/state";
import userEvent from "@testing-library/user-event";
import mockedRouter from "../../test-utils/mockNextRouter";

/**
 * Sort by
 *  - has the right options
 *  - does redirect
 */
const stateWithFacets = (facets: FacetGroupData[]): State =>
  merge(fixtures.initialState, {
    collection: {
      data: {
        facetGroups: facets
      }
    }
  });

const sortByFacet: FacetGroupData = {
  label: "Sort by",
  facets: [
    {
      label: "author",
      href: "/author",
      active: true
    },
    {
      label: "title",
      href: "/title",
      active: false
    }
  ]
};

const availabilityFacet: FacetGroupData = {
  label: "Availability",
  facets: [
    {
      label: "All",
      href: "/all",
      active: true
    },
    {
      label: "Yours to keep",
      href: "/yours-to-keep",
      active: false
    },
    {
      label: "Available now",
      href: "/now",
      active: false
    }
  ]
};

test("renders sort by select with correct options", () => {
  const utils = render(<ListFilters />, {
    initialState: stateWithFacets([sortByFacet])
  });

  const facet = utils.getByLabelText("Sort by");
  expect(utils.getByText("author")).toBeInTheDocument();
  expect(utils.getByText("title")).toBeInTheDocument();

  expect(facet).toHaveValue("author");
});

test("renders availability select with correct options", () => {
  const utils = render(<ListFilters />, {
    initialState: stateWithFacets([availabilityFacet])
  });

  const facet = utils.getByLabelText("Availability");
  expect(utils.getByText("All")).toBeInTheDocument();
  expect(utils.getByText("Yours to keep")).toBeInTheDocument();
  expect(utils.getByText("Available now")).toBeInTheDocument();

  expect(facet).toHaveValue("All");
});

test("does redirect when selected", () => {
  const utils = render(<ListFilters />, {
    initialState: stateWithFacets([sortByFacet])
  });

  const facet = utils.getByLabelText("Sort by");

  userEvent.selectOptions(facet, "title");

  expect(mockedRouter.push).toHaveBeenCalledTimes(1);
  expect(mockedRouter.push).toHaveBeenCalledWith(
    "/collection/[collectionUrl]",
    "/collection/title"
  );
});
