import { OPDS1 } from "interfaces";
import { parseLinks } from "utils/libraryLinks";

test("properly extracts links", () => {
  const helpEmail: OPDS1.Link = {
    rel: "help",
    href: "/help"
  };
  const helpWebsite: OPDS1.Link = {
    rel: "help",
    type: "text/html",
    href: "/help-site"
  };
  const privacy: OPDS1.Link = {
    rel: "privacy-policy",
    href: "/privacy"
  };
  const terms: OPDS1.Link = {
    rel: "terms-of-service",
    href: "/terms"
  };
  const about: OPDS1.Link = {
    rel: "about",
    href: "/about"
  };
  const website: OPDS1.Link = {
    rel: "alternate",
    href: "/website"
  };

  const links: OPDS1.Link[] = [
    helpEmail,
    helpWebsite,
    privacy,
    terms,
    about,
    website,
    {
      rel: "authenticate",
      href: "/not-to-be-used"
    }
  ];

  const data = parseLinks(links);

  expect(data).toEqual({
    helpWebsite,
    helpEmail,
    privacyPolicy: privacy,
    tos: terms,
    about,
    libraryWebsite: website
  });
});
