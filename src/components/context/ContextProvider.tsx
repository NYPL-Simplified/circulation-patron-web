import * as React from "react";
import { LibraryData } from "interfaces";
import UrlShortener from "UrlShortener";
import { LibraryProvider } from "./LibraryContext";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import { RouterProvider } from "./RouterContext";
import OPDSStore from "opds-web-client/lib/components/context/StoreContext";
import { RecommendationsProvider } from "./RecommendationsContext";
import { ActionsProvider } from "opds-web-client/lib/components/context/ActionsContext";
import { Provider as ReakitProvider } from "reakit";
import { State } from "opds-web-client/lib/state";
import { Store } from "redux";
import { ThemeProvider } from "theme-ui";
import makeTheme from "../../theme";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionsCreator from "opds-web-client/lib/actions";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import basicAuthPlugin from "auth/basicAuthPlugin";
import samlAuthPlugin from "auth/samlAuthPlugin";
import CleverAuthPlugin from "auth/cleverAuthPlugin";
import getPathFor from "utils/getPathFor";
import { LinkUtilsProvider } from "./LinkUtilsContext";
import { SHORTEN_URLS } from "utils/env";
import { PathFor } from "opds-web-client/lib/interfaces";

type ProviderProps = {
  library: LibraryData;
  store?: Store<State>;
  actions?: ActionsCreator;
  fetcher?: DataFetcher;
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({
  children,
  library,
  store,
  actions,
  fetcher
}) => {
  const librarySlug = library.slug;
  const urlShortener = new UrlShortener(library.catalogUrl, SHORTEN_URLS);
  const pathFor: PathFor = getPathFor(urlShortener, librarySlug);
  const computedFetcher = React.useMemo(
    () => fetcher ?? new DataFetcher({ adapter }),
    [fetcher]
  );
  const computedActions = React.useMemo(
    () => actions ?? new ActionsCreator(computedFetcher),
    [actions, computedFetcher]
  );

  const theme = makeTheme(library.colors);

  return (
    <ThemeProvider theme={theme}>
      <ReakitProvider>
        <RouterProvider>
          <PathForProvider pathFor={pathFor}>
            <OPDSStore
              store={store}
              authPlugins={[basicAuthPlugin, samlAuthPlugin, CleverAuthPlugin]}
            >
              <RecommendationsProvider>
                <ActionsProvider
                  actions={computedActions}
                  fetcher={computedFetcher}
                >
                  <LibraryProvider library={library}>
                    <LinkUtilsProvider
                      library={library}
                      urlShortener={urlShortener}
                    >
                      {children}
                    </LinkUtilsProvider>
                  </LibraryProvider>
                </ActionsProvider>
              </RecommendationsProvider>
            </OPDSStore>
          </PathForProvider>
        </RouterProvider>
      </ReakitProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
