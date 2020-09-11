import * as React from "react";
import { LibraryData } from "interfaces";
import UrlShortener from "UrlShortener";
import { LibraryProvider } from "./LibraryContext";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import { RouterProvider } from "./RouterContext";
import { RecommendationsProvider } from "./RecommendationsContext";
import { Provider as ReakitProvider } from "reakit";
import getPathFor from "utils/getPathFor";
import { LinkUtilsProvider } from "./LinkUtilsContext";
import { SHORTEN_URLS } from "utils/env";
import { PathFor } from "opds-web-client/lib/interfaces";

type ProviderProps = {
  library: LibraryData;
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  const librarySlug = library.slug;
  const urlShortener = new UrlShortener(library.catalogUrl, SHORTEN_URLS);
  const pathFor: PathFor = getPathFor(urlShortener, librarySlug);

  return (
    <ReakitProvider>
      <RouterProvider>
        <PathForProvider pathFor={pathFor}>
          <RecommendationsProvider>
            <LibraryProvider library={library}>
              <LinkUtilsProvider library={library} urlShortener={urlShortener}>
                {children}
              </LinkUtilsProvider>
            </LibraryProvider>
          </RecommendationsProvider>
        </PathForProvider>
      </RouterProvider>
    </ReakitProvider>
  );
};

export default AppContextProvider;
