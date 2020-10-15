import {
  basicAuthMethod,
  cleverAuthMethod,
  createSamlMethod
} from "test-utils/fixtures/auth";
import { LibraryData } from "../../interfaces";

/**
 * Copied via chrome console from sample app.
 */
export const libraryData: LibraryData = {
  slug: "testlib",
  logoUrl: null,
  catalogUrl: "http://test-cm.com/catalogUrl",
  catalogName: "XYZ Public Library",
  colors: {
    primary: "#337ab7",
    secondary: "#d9534f"
  },
  headerLinks: [
    {
      href: "https://www.loc.gov/",
      rel: "related",
      type: "text/html",
      title: "LOC",
      role: "navigation"
    }
  ],
  libraryLinks: {},
  shelfUrl: "/shelf-url",
  authMethods: [basicAuthMethod, createSamlMethod(0), cleverAuthMethod],
  searchData: {
    url: "/search-url",
    description: "search-description",
    shortName: "search shortname",
    template: "/search/{searchTerms}"
  }
};

export default libraryData;
