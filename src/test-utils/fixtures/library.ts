import { LibraryData } from "../../interfaces";

/**
 * Copied via chrome console from sample app.
 */
export const libraryData: LibraryData = {
  onlyLibrary: true,
  catalogUrl: "http://test-cm.com/catalogUrl",
  catalogName: "XYZ Public Library",
  colors: {
    foreground: "#ffffff",
    background: "#000000"
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
  cssLinks: [
    {
      href:
        "http://simplye-dev-web.amigos.org/resources/xyzlib/styles/test-css.css",
      type: "text/css",
      rel: "stylesheet"
    }
  ],
  libraryLinks: {}
};

export default libraryData;
