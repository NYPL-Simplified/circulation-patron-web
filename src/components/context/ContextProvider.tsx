import * as React from "react";
import { LibraryData } from "interfaces";
import UrlShortener from "UrlShortener";
import { LibraryProvider } from "./LibraryContext";
import { RecommendationsProvider } from "./RecommendationsContext";
import { Provider as ReakitProvider } from "reakit";
import { LinkUtilsProvider } from "./LinkUtilsContext";
import { SHORTEN_URLS } from "utils/env";

type ProviderProps = {
  library: LibraryData;
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  const urlShortener = new UrlShortener(library.catalogUrl, SHORTEN_URLS);

  return (
    <ReakitProvider>
      <RecommendationsProvider>
        <LibraryProvider library={library}>
          <LinkUtilsProvider library={library} urlShortener={urlShortener}>
            {children}
          </LinkUtilsProvider>
        </LibraryProvider>
      </RecommendationsProvider>
    </ReakitProvider>
  );
};

export default AppContextProvider;
