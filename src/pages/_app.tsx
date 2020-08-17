import * as React from "react";
import { AppProps } from "next/app";
import ContextProvider from "../components/context/ContextProvider";
import {
  SHORTEN_URLS,
  IS_SERVER,
  IS_DEVELOPMENT,
  REACT_AXE,
  IS_MULTI_LIBRARY
} from "../utils/env";
import getPathFor from "../utils/getPathFor";
import UrlShortener from "../UrlShortener";
import getLibraryData, {
  setLibraryData,
  getConfig
} from "../dataflow/getLibraryData";
import getOrCreateStore from "../dataflow/getOrCreateStore";
import { LibraryData } from "../interfaces";
import { State } from "opds-web-client/lib/state";
import { ThemeProvider } from "theme-ui";
import Auth from "../components/Auth";
import ErrorBoundary from "../components/ErrorBoundary";
import Head from "next/head";
import Error from "components/Error";
import { ParsedUrlQuery } from "querystring";
import enableAxe from "utils/axe";
import "system-font-css";
import { Config } from "dataflow/LibraryDataCache";
import "@nypl/design-system-react-components/dist/styles.css";
import "css-overrides.css";
import makeTheme from "../theme";

type NotFoundProps = {
  statusCode: number;
  configFile?: Config;
};

type InitialData = {
  library: LibraryData;
  initialState: State;
};

type MyAppProps = InitialData | NotFoundProps;

function is404(props: MyAppProps): props is NotFoundProps {
  return !!(props as NotFoundProps).statusCode;
}

const MyApp = (props: MyAppProps & AppProps) => {
  /**
   * If there was no library or initialState provided, render the error page
   */

  if (is404(props)) {
    return (
      <Error statusCode={props.statusCode} configFile={props.configFile} />
    );
  }

  const { library, initialState, Component, pageProps } = props;
  const urlShortener = new UrlShortener(library.catalogUrl, SHORTEN_URLS);
  const pathFor = getPathFor(urlShortener, library.id);
  const store = getOrCreateStore(pathFor, initialState);
  setLibraryData(library);

  const theme = makeTheme(library.colors);

  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <Head>
        {/* define the default title */}
        <title>{library.catalogName}</title>
      </Head>
      <ContextProvider
        shortenUrls={SHORTEN_URLS}
        library={library}
        store={store}
      >
        <ThemeProvider theme={theme}>
          <Auth>
            <Component {...pageProps} />
          </Auth>
        </ThemeProvider>
      </ContextProvider>
    </ErrorBoundary>
  );
};

/**
 * The query object type doesn't protect against undefined values, and
 * the "library" variable could be an array if you pass ?library=xxx&library=zzz
 * so this is essentially a typeguard for a situation that shouldn't happen.
 */
const getLibraryFromQuery = (
  query: ParsedUrlQuery | undefined
): string | undefined => {
  const libraryQuery: string | string[] | undefined = query?.library;
  return libraryQuery
    ? typeof libraryQuery === "string"
      ? libraryQuery
      : libraryQuery[0]
    : undefined;
};

MyApp.getInitialProps = async ({ ctx, _err }) => {
  const { query } = ctx;

  /**
   * Get libraryData from the DataCache, which we will then set
   * in the redux store. We need to augment this for settings
   *  CONFIG_FILE
   *  LIBRARY_REGISTRY
   */
  const parsedLibrary = getLibraryFromQuery(query);
  const libraryData = await getLibraryData(parsedLibrary);

  /**
   * This guard checks if you are running as a single library but
   * attempting to access a multi-library route
   */
  const isMultiLibraryRoute = ctx.pathname?.includes?.("[library]");
  const shouldNotHaveAccess = isMultiLibraryRoute && !IS_MULTI_LIBRARY;

  if (!libraryData || shouldNotHaveAccess) {
    console.warn(
      "Returning 404 for pathname: ",
      ctx.pathname,
      " and as path: ",
      ctx.asPath
    );
    const config = await getConfig();
    if (ctx.res) ctx.res.statusCode = 404;
    return { statusCode: 404, configFile: config };
  }

  /**
   * Create the resources we need to complete a server render
   */
  const urlShortener = new UrlShortener(libraryData.catalogUrl, SHORTEN_URLS);
  const pathFor = getPathFor(urlShortener, libraryData.id);
  const store = getOrCreateStore(pathFor);

  /**
   * Pass updated redux state to the app component to be used to rebuild
   * the store on client side with pre-filled data from ssr
   */
  const initialState = store.getState();

  return {
    initialState,
    SHORTEN_URLS,
    pathFor,
    library: libraryData
  };
};

if (IS_DEVELOPMENT && !IS_SERVER && REACT_AXE) {
  enableAxe();
}

const AppErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div>
      <p sx={{ textAlign: "center" }}>{message}</p>
    </div>
  );
};

export default MyApp;
