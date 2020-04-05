import * as React from "react";
import { PathFor, PreloadedData } from "../../interfaces";
import UrlShortener from "../../UrlShortener";
import { LibraryProvider } from "./LibraryContext";
import { UrlShortenerProvider } from "./UrlShortenerContext";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import { RouterProvider } from "./RouterContext";
import OPDSStore from "opds-web-client/lib/components/context/StoreContext";
import { RecommendationsProvider } from "./RecommendationsContext";
import { ActionsProvider } from "opds-web-client/lib/components/context/ActionsContext";
import { Provider as ReakitProvider } from "reakit";
import { HelmetProvider } from "react-helmet-async";
import { ViewProvider } from "./ViewContext";
import { State } from "opds-web-client/lib/state";
import { Store } from "redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionsCreator from "opds-web-client/lib/actions";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import basicAuthPlugin from "../../auth/basicAuthPlugin";
import getPathFor from "../../utils/getPathFor";

type ProviderProps = PreloadedData & {
  // we allow custom store and actions
  // to be passed in for the sake of mocking during testing
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
  shortenUrls,
  initialState,
  helmetContext,
  store,
  actions,
  fetcher
}) => {
  const libraryId = library.id;
  const urlShortener = new UrlShortener(library.catalogUrl, shortenUrls);
  const pathFor: PathFor = getPathFor(urlShortener, libraryId);
  const computedFetcher = fetcher ?? new DataFetcher({ adapter });
  const computedActions = actions ?? new ActionsCreator(computedFetcher);

  return (
    <HelmetProvider context={helmetContext}>
      <ReakitProvider>
        <RouterProvider>
          <PathForProvider pathFor={pathFor}>
            <OPDSStore
              initialState={initialState}
              store={store}
              authPlugins={[basicAuthPlugin]}
            >
              <RecommendationsProvider>
                <ActionsProvider
                  actions={computedActions}
                  fetcher={computedFetcher}
                >
                  <LibraryProvider library={library}>
                    <UrlShortenerProvider urlShortener={urlShortener}>
                      <ViewProvider>{children}</ViewProvider>
                    </UrlShortenerProvider>
                  </LibraryProvider>
                </ActionsProvider>
              </RecommendationsProvider>
            </OPDSStore>
          </PathForProvider>
        </RouterProvider>
      </ReakitProvider>
    </HelmetProvider>
  );
};

export default AppContextProvider;
