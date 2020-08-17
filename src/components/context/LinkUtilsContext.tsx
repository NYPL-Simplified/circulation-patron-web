import * as React from "react";
import { NextLinkConfig, LibraryData } from "../../interfaces";
import UrlShortener from "../../UrlShortener";

type LinkBuilder = (url: string) => NextLinkConfig;
type BuildMultiLibraryLink = (config: NextLinkConfig) => NextLinkConfig;

export type LinkUtils = {
  buildBookLink: LinkBuilder;
  buildCollectionLink: LinkBuilder;
  buildMultiLibraryLink: BuildMultiLibraryLink;
  urlShortener: UrlShortener;
};
const LinkUtilsContext = React.createContext<LinkUtils | undefined>(undefined);

const trailingSlashRegex = /\/$/;

export const LinkUtilsProvider: React.FC<{
  library: LibraryData;
  urlShortener: UrlShortener;
}> = ({ library, urlShortener, children }) => {
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
    const preparedCollectionUrl = urlShortener.prepareCollectionUrl(
      collectionUrl
    );
    // if there is no prepared collection url, you should go home
    if (!preparedCollectionUrl) {
      return buildMultiLibraryLink({
        href: "/",
        as: "/"
      });
    }
    return buildMultiLibraryLink({
      href: "/collection/[collectionUrl]",
      as: `/collection/${preparedCollectionUrl}`
    });
  };

  const buildBookLink: LinkBuilder = (bookUrl: string) => {
    const preparedBookUrl = urlShortener.prepareBookUrl(bookUrl);

    return buildMultiLibraryLink({
      href: "/book/[bookUrl]",
      as: `/book/${preparedBookUrl}`
    });
  };

  return (
    <LinkUtilsContext.Provider
      value={{
        buildMultiLibraryLink,
        buildBookLink,
        buildCollectionLink,
        urlShortener
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
