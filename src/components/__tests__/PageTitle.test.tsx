import * as React from "react";
import { render, fixtures } from "../../test-utils";
import { FacetGroupData, CollectionData } from "interfaces";
import PageTitle from "components/PageTitle";
import userEvent from "@testing-library/user-event";
import { mockPush } from "test-utils/mockNextRouter";

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

const collection: CollectionData = {
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
    const utils = render(<PageTitle collection={collection}>Child</PageTitle>);
    expect(utils.getByRole("option", { name: "All" })).toBeTruthy();
    expect(utils.getByRole("option", { name: "eBooks" })).toBeTruthy();
    expect(utils.getByRole("option", { name: "Audiobooks" })).toBeTruthy();
  });

  test("format filters navigate to respective urls", async () => {
    const utils = render(<PageTitle collection={collection}>Child</PageTitle>);

    const select = utils.getByRole("combobox", {
      name: "Format"
    }) as HTMLSelectElement;
    // all is selected
    expect(select.value).toBe("http://ebooks");

    // click works
    userEvent.selectOptions(select, "http://all");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      "/testlib/collection/http%3A%2F%2Fall"
    );
  });
});
