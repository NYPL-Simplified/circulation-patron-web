import { LibraryData } from "../../interfaces";

/**
 * Copied via chrome console from sample app.
 */
export const libraryData: LibraryData = {
  id: "library-auth-id",
  logoUrl: null,
  onlyLibrary: true,
  catalogUrl: "http://test-cm.com/catalogUrl",
  catalogName: "XYZ Public Library",
  colors: {
    primary: "#ffffff",
    secondary: "#000000"
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
  libraryLinks: {}
};

export default libraryData;
