import * as React from "react";
import { render, fixtures } from "../../test-utils";
import merge from "deepmerge";
import Layout from "../Layout";
import { LibraryData, Link } from "../../interfaces";

const link: Link = {
  href: "/wherever",
  rel: "rel"
};
const libraryWithLinks: LibraryData = merge(fixtures.libraryData, {
  libraryLinks: {
    helpEmail: link,
    helpWebsite: link,
    privacyPolicy: link,
    tos: link,
    about: link,
    registration: link,
    libraryWebsite: link
  }
});

test("shows external links when present in state w/ apropriate attributes", () => {
  const node = render(<Layout>Some children</Layout>, {
    library: libraryWithLinks
  });
  const expectExternalLink = (name: string) => {
    const lnk = node.queryByText(name);
    expect(lnk).toBeInTheDocument();
    expect(lnk).toHaveAttribute("href", "/wherever");
    expect(lnk).toHaveAttribute("rel", "noopener noreferrer");
    expect(lnk).toHaveAttribute("target", "__blank");
  };
  expectExternalLink("Library Website");
  expectExternalLink("Patron Registration");
  expectExternalLink("Email Support");
  expectExternalLink("Help Website");
  expectExternalLink("Privacy");
  expectExternalLink("Terms of Use");
  expectExternalLink("About");
});
