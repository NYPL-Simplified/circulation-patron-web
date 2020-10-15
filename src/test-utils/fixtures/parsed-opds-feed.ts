import { OPDSFeed, OPDSLink, OPDSEntry } from "opds-feed-parser";
import { OPDS1 } from "interfaces";

const authDocLink: OPDSLink = {
  href: "/auth-doc",
  rel: OPDS1.AuthDocLinkRelation,
  type: "some-type",
  title: "auth-doc-link-title",
  role: "auth-doc-role"
};

const opdsSearch: OPDSFeed["search"] = {
  totalResults: 10,
  startIndex: 0,
  itemsPerPage: 5
};

const opdsEntries: OPDSEntry[] = [];
const opdsLinks: OPDSLink[] = [authDocLink];

export const opdsFeed: OPDSFeed = new OPDSFeed({
  id: "opds-feed-id",
  title: "opds-feed-title",
  updated: "opds-feed-updated",
  complete: true,
  search: opdsSearch,
  links: opdsLinks,
  entries: opdsEntries,
  unparsed: "unparsed-feed"
});
