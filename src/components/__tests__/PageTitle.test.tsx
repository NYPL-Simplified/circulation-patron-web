import * as React from "react";
import { render, fixtures } from "../../test-utils";
import merge from "deepmerge";
import { FacetGroupData, CollectionData } from "opds-web-client/lib/interfaces";
import PageTitle from "components/PageTitle";
import { State } from "opds-web-client/lib/state";
import userEvent from "@testing-library/user-event";
import { mockPush } from "test-utils/mockNextRouter";

const formatsFacet: FacetGroupData = {
  label: "Formats",
  facets: [
    {
      label: "eBooks",
      active: true,
      href: "/ebooks"
    },
    {
      label: "Audiobooks",
      href: "/audiobooks",
      active: false
    },
    {
      label: "All",
      href: "/all",
      active: false
    }
  ]
};

const collectionData: CollectionData = {
  ...fixtures.initialState.collection.data,
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
      books: fixtures.makeBooks(10)
    }
  ]
};

const stateWithFacets: State = merge<State>(fixtures.initialState, {
  collection: {
    ...fixtures.initialState.collection,
    data: collectionData
  }
});

describe("Format filters", () => {
  test("Format filters not rendered when not in state", () => {
    const utils = render(<PageTitle>Child</PageTitle>);
    expect(utils.queryByLabelText("Format filters")).toBeFalsy();
    expect(utils.queryByText("All")).toBeFalsy();
    expect(utils.queryByLabelText("Books")).toBeFalsy();
    expect(utils.queryByLabelText("Audiobooks")).toBeFalsy();
  });
  test("Format filters are visible in PageTitle w/ facets", () => {
    const utils = render(<PageTitle>Child</PageTitle>, {
      initialState: stateWithFacets
    });
    expect(utils.getByRole("option", { name: "All" })).toBeTruthy();
    expect(utils.getByRole("option", { name: "eBooks" })).toBeTruthy();
    expect(utils.getByRole("option", { name: "Audiobooks" })).toBeTruthy();
  });

  test("format filters navigate to respective urls", async () => {
    const utils = render(<PageTitle>Child</PageTitle>, {
      initialState: stateWithFacets
    });

    const select = utils.getByRole("combobox", {
      name: "Format"
    }) as HTMLSelectElement;
    // all is selected
    expect(select.value).toBe("/ebooks");

    // click works
    userEvent.selectOptions(select, "/all");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      "/collection/[collectionUrl]",
      "/collection/all"
    );
  });
});
