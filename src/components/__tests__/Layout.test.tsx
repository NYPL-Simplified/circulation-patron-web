import * as React from "react";
import { render } from "../../test-utils";
import Layout from "../Layout";
import userEvent from "@testing-library/user-event";

describe("Layout nav + structure", () => {
  test("Library icon button navigates home", () => {
    const utils = render(<Layout>Child</Layout>);
    const homeButton = utils.getByLabelText(
      "Library catalog, back to homepage"
    );

    // the home button should navigate to "/"
    expect(homeButton.closest("a")).toHaveAttribute("href", "/testlib");
  });

  test("my books navigates to /loans", () => {
    const utils = render(<Layout>Child</Layout>);
    const myBooks = utils.getAllByRole("link", { name: "My Books" });
    myBooks.forEach(ln => expect(ln).toHaveAttribute("href", "/testlib/loans"));
  });

  test("displays children within main", () => {
    const utils = render(<Layout>Some children</Layout>);
    const main = utils.getByRole("main");
    expect(main).toHaveTextContent("Some children");
  });

  test("provides a working skip nav link", async () => {
    const utils = render(<Layout>Child</Layout>);
    const skipNav = utils.getByText("Skip to content").closest("a");
    const main = utils.getByRole("main");

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
