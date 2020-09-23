import useLibraryContext from "components/context/LibraryContext";
import * as React from "react";
import { NextLinkConfig, LibraryData } from "../../interfaces";

type LinkBuilder = (url: string) => NextLinkConfig;
type BuildMultiLibraryLink = (config: NextLinkConfig) => NextLinkConfig;

export type LinkUtils = {
  buildBookLink: LinkBuilder;
  buildCollectionLink: LinkBuilder;
  buildMultiLibraryLink: BuildMultiLibraryLink;
};
const LinkUtilsContext = React.createContext<LinkUtils | undefined>(undefined);

const trailingSlashRegex = /\/$/;

export const LinkUtilsProvider: React.FC<{
  library: LibraryData;
}> = ({ library, children }) => {
  const { catalogUrl } = useLibraryContext();
  const buildMultiLibraryLink: BuildMultiLibraryLink = ({ href, as }) => {
    if (library.slug) {
      return {
        // if no as was passed, but you're adding one now, use the href
        as: `/${library.slug}${as ? as : href}`.replace(trailingSlashRegex, ""),
        href: `/[library]${href}`.replace(trailingSlashRegex, "")
      };
    }
    return { href, as };
  };

  const buildCollectionLink: LinkBuilder = (collectionUrl: string) => {
    // if there is no collection url, or it is the catalog root, go home
    if (
      !collectionUrl ||
      collectionUrl.replace(trailingSlashRegex, "") === catalogUrl
    ) {
      return buildMultiLibraryLink({
        href: "/",
        as: "/"
      });
    }
    return buildMultiLibraryLink({
      href: "/collection/[collectionUrl]",
      as: `/collection/${encodeURIComponent(collectionUrl)}`
    });
  };

  const buildBookLink: LinkBuilder = (bookUrl: string) => {
    return buildMultiLibraryLink({
      href: "/book/[bookUrl]",
      as: `/book/${encodeURIComponent(bookUrl)}`
    });
  };

  return (
    <LinkUtilsContext.Provider
      value={{
        buildMultiLibraryLink,
        buildBookLink,
        buildCollectionLink
      }}
    >
      {children}
    </LinkUtilsContext.Provider>
  );
};

export default function useLinkUtils() {
  const context = React.useContext(LinkUtilsContext);
  if (typeof context === "undefined") {
    throw new Error("useLinkUtils must be used within a LinkUtilsProvider");
  }
  return context;
}
