import { OPDS1, LibraryLinks } from "interfaces";

/**
 * Parse the links provided in the LibraryData to get an object
 * you can use
 */

const HELP_REL = "help";
const HELP_URL_TYPE = "text/html";
const PRIVACY_POLICY_REL = "privacy-policy";
const TOS_REL = "terms-of-service";
const ABOUT_REL = "about";
const LIBRARY_WEBSITE_REL = "alternate";

export function parseLinks(links: OPDS1.Link[]): LibraryLinks {
  const linkMap: LibraryLinks = {};
  links.forEach(link => {
    switch (link.rel) {
      case HELP_REL:
        if (link.type === HELP_URL_TYPE) {
          linkMap.helpWebsite = link;
        } else {
          linkMap.helpEmail = link;
        }
        break;
      case PRIVACY_POLICY_REL:
        linkMap.privacyPolicy = link;
        break;
      case TOS_REL:
        linkMap.tos = link;
        break;
      case ABOUT_REL:
        linkMap.about = link;
        break;
      case LIBRARY_WEBSITE_REL:
        linkMap.libraryWebsite = link;
        break;
      default:
        break;
    }
  });

  return linkMap;
}

export function getReportUrl(raw: any) {
  const reportLink = raw?.link?.find?.(
    (link: any) => link?.["$"]?.["rel"]?.["value"] === "issues"
  );

  if (!reportLink) {
    return null;
  }

  return reportLink?.["$"]?.["href"]?.["value"];
}
