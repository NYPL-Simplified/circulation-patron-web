import * as React from "react";
import { render, fixtures } from "../../test-utils";
import Layout from "../Layout";
import { State } from "opds-web-client/lib/state";
import { FacetGroupData, LaneData } from "opds-web-client/lib/interfaces";
import merge from "deepmerge";
import userEvent from "@testing-library/user-event";

describe("Layout nav + structure", () => {
  test("Library name button navigates home", () => {
    const node = render(<Layout>Child</Layout>);
    const homeButton = node.getByText("Library System");

    // the home button should navigate to "/"
    expect(homeButton.closest("a")).toHaveAttribute("href", "/");
  });

  test("my books navigates to /loans", () => {
    const node = render(<Layout>Child</Layout>, {
      initialState: merge(fixtures.initialState, {
        loans: {
          url: "/myloans" // this url is not used for navigation, but for fetching loans
        }
      })
    });
    const myBooks = node.getByText("My Books").closest("a");
    expect(myBooks).toHaveAttribute("href", "/loans");
  });

  test("displays children within main", () => {
    const node = render(<Layout>Some children</Layout>);
    const main = node.getByRole("main");
    expect(main).toHaveTextContent("Some children");
  });

  test("provides a working skip nav link", async () => {
    const node = render(<Layout>Child</Layout>);
    const skipNav = node.getByText("Skip to content").closest("a");
    const main = node.getByRole("main");

    userEvent.tab();
    expect(skipNav).toHaveFocus();
    /**
     * All we can do with jsdom is make sure that the id of main matches the href of skip navigation
     */
    expect(skipNav).toHaveAttribute("href", `#${main.id}`);
  });

  test("provides global styles", () => {
    render(<Layout>Some children</Layout>);
    expect(document.body).toHaveStyle("margin: 0;");
  });
});

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

const stateWithFacets: State = merge(fixtures.initialState, {
  collection: {
    data: {
      facetGroups: [formatsFacet]
    }
  }
});

describe("Format filters", () => {
  test("Format filters not rendered when showFormatFilter not provided", () => {
    const node = render(<Layout>Child</Layout>, {
      initialState: stateWithFacets
    });
    expect(node.queryByLabelText("Format filters")).toBeFalsy();
    expect(node.queryByText("All")).toBeFalsy();
    expect(node.queryByLabelText("Books")).toBeFalsy();
    expect(node.queryByLabelText("Audiobooks")).toBeFalsy();
  });
  test("Format filters are visible on home w/ facets", () => {
    const node = render(<Layout showFormatFilter>Child</Layout>, {
      initialState: stateWithFacets
    });
    expect(node.getByText("ALL")).toBeTruthy();
    expect(node.getByLabelText("Books")).toBeTruthy();
    expect(node.getByLabelText("Audiobooks")).toBeTruthy();
  });

  test("format filters are visible on collection w/ facets present", () => {
    const node = render(<Layout showFormatFilter>Child</Layout>, {
      initialState: stateWithFacets
    });
    expect(node.getByText("ALL")).toBeTruthy();
    expect(node.getByLabelText("Books")).toBeTruthy();
    expect(node.getByLabelText("Audiobooks")).toBeTruthy();
  });

  test("format filters are not visible if facets arent present", () => {
    const node = render(<Layout showFormatFilter>Child</Layout>, {
      // should render collection.data = null
      initialState: undefined
    });

    expect(node.queryByText("ALL")).toBeNull();
    expect(node.queryByLabelText("Books")).toBeNull();
    expect(node.queryByLabelText("Audiobooks")).toBeNull();
  });

  test("format filters navigate to respective urls", () => {
    const node = render(<Layout showFormatFilter>Child</Layout>, {
      initialState: stateWithFacets
    });

    expect(node.queryByText("ALL")?.closest("a")).toHaveAttribute(
      "href",
      "/collection/all"
    );
    expect(node.queryByLabelText("Books")?.closest("a")).toHaveAttribute(
      "href",
      "/collection/ebooks"
    );
    expect(node.queryByLabelText("Audiobooks")?.closest("a")).toHaveAttribute(
      "href",
      "/collection/audiobooks"
    );
  });

  test("format filter has aria-current", () => {
    const node = render(<Layout showFormatFilter>Child</Layout>, {
      initialState: stateWithFacets
    });
    // need to test both visual and aria here
    expect(node.queryByText("ALL")?.closest("a")).toHaveAttribute(
      "aria-current",
      "false"
    );
    expect(node.queryByLabelText("Books")?.closest("a")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(node.queryByLabelText("Audiobooks")?.closest("a")).toHaveAttribute(
      "aria-current",
      "false"
    );
  });
});

/**
 * Gallery selectors
 */
const stateWithBooks: State = merge(fixtures.initialState, {
  collection: {
    data: {
      books: [fixtures.book, fixtures.book, fixtures.book]
    }
  }
});
const lane: LaneData = {
  title: "a lane",
  url: "/somewhere",
  books: [fixtures.book, fixtures.book, fixtures.book]
};
const stateWithLanes: State = merge(fixtures.initialState, {
  collection: {
    data: {
      lanes: [lane]
    }
  }
});

describe("Gallery selectors", () => {
  test("shows gallery/list selector when books are present", () => {
    const node = render(<Layout>Some children</Layout>, {
      initialState: stateWithBooks
    });
    expect(node.getByLabelText("Gallery View")).toBeInTheDocument();
    expect(node.getByLabelText("List View")).toBeInTheDocument();
  });

  test("gallery is selected by default", () => {
    const node = render(<Layout>Some children</Layout>, {
      initialState: stateWithBooks
    });
    const galleryRadio = node.getByLabelText("Gallery View");
    const listRadio = node.getByLabelText("List View");
    expect(galleryRadio).toHaveAttribute("aria-checked", "true");
    expect(listRadio).toHaveAttribute("aria-checked", "false");
  });

  test("correctly toggles between gallery/list views", () => {
    const node = render(<Layout>Some children</Layout>, {
      initialState: stateWithBooks
    });
    const galleryRadio = node.getByLabelText("Gallery View");
    const listRadio = node.getByLabelText("List View");
    expect(galleryRadio).toHaveAttribute("aria-checked", "true");

    userEvent.click(listRadio);

    expect(listRadio).toHaveAttribute("aria-checked", "true");
  });

  test("doesn't show view changer if no books present", () => {
    const node = render(<Layout>Some children</Layout>, {
      initialState: stateWithLanes
    });
    expect(node.queryAllByRole("radio")).toHaveLength(0);
    expect(node.queryByLabelText("Gallery View")).toBeNull();
    expect(node.queryByLabelText("List View")).toBeNull();
  });
});
