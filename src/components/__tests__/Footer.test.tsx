import * as React from "react";
import { render, fixtures } from "../../test-utils";
import merge from "deepmerge";
import Footer from "components/Footer";
import { LibraryData, OPDSLink } from "../../interfaces";
import * as env from "../../utils/env";

const link: OPDSLink = {
  href: "/wherever",
  rel: "navigation"
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
  const utils = render(<Footer />, {
    library: libraryWithLinks
  });
  const expectExternalLink = (name: string) => {
    const lnk = utils.getByRole("link", { name });
    expect(lnk).toBeInTheDocument();
    expect(lnk).toHaveAttribute("href", "/wherever");
    expect(lnk).toHaveAttribute("rel", "noopener noreferrer");
    expect(lnk).toHaveAttribute("target", "__blank");
  };
  expectExternalLink("Library Homepage (Opens in a new tab)");
  expectExternalLink("Need a library card? (Opens in a new tab)");
  expectExternalLink("Email Support (Opens in a new tab)");
  expectExternalLink("Help Website (Opens in a new tab)");
  expectExternalLink("Privacy (Opens in a new tab)");
  expectExternalLink("Terms of Use (Opens in a new tab)");
  expectExternalLink("About (Opens in a new tab)");

  // my books nav link
  const myBooks = utils.getByRole("link", { name: /my books/i });
  expect(myBooks).toBeInTheDocument();
  expect(myBooks).toHaveAttribute("href", "/loans");
});

describe("toggling SimplyE Branding", () => {
  test("does not show simplyE callout when NEXT_PUBLIC_COMPANION_APP is 'openebooks'", () => {
    (env.NEXT_PUBLIC_COMPANION_APP as string) = "openebooks";

    const utils = render(<Footer />);

    expect(utils.queryByText(/download simplye/i)).not.toBeInTheDocument();

    expect(
      utils.queryByText(
        "Our mobile app lets you browse, borrow and read from our whole collection of eBooks and Audiobooks right on your phone!"
      )
    ).not.toBeInTheDocument();

    // badges
    const iosbadge = utils.queryByText(
      /download simplye on the apple app store/i
    );

    expect(iosbadge).not.toBeInTheDocument();

    const googleBadge = utils.queryByText(
      /get simplye on the google play store/
    );
    expect(googleBadge).not.toBeInTheDocument();

    // my books nav link
    const myBooks = utils.queryByText(/my books/i);
    expect(myBooks).toBeInTheDocument();
    expect(myBooks).toHaveAttribute("href", "/loans");
  });

  test("shows simplyE callout when NEXT_PUBLIC_COMPANION_APP is 'simplye'", () => {
    (env.NEXT_PUBLIC_COMPANION_APP as string) = "simplye";

    const utils = render(<Footer />);

    expect(
      utils.getByRole("heading", {
        name: /download simplye/i
      })
    ).toBeInTheDocument();

    expect(
      utils.getByText(
        "Our mobile app lets you browse, borrow and read from our whole collection of eBooks and Audiobooks right on your phone!"
      )
    ).toBeInTheDocument();

    // badges
    const iosbadge = utils.getByRole("link", {
      name: /download simplye on the apple app store/i
    });
    expect(iosbadge).toBeInTheDocument();
    expect(iosbadge).toHaveAttribute(
      "href",
      "https://apps.apple.com/us/app/simplye/id1046583900"
    );

    const googleBadge = utils.getByRole("link", {
      name: /get simplye on the google play store/i
    });
    expect(googleBadge).toBeInTheDocument();
    expect(googleBadge).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=org.nypl.simplified.simplye&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
    );

    // my books nav link
    const myBooks = utils.getByRole("link", {
      name: /my books/i
    });
    expect(myBooks).toBeInTheDocument();
    expect(myBooks).toHaveAttribute("href", "/loans");
  });
});
