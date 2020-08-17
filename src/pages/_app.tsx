import * as React from "react";
import { AppProps } from "next/app";
import ContextProvider from "../components/context/ContextProvider";
import {
  SHORTEN_URLS,
  IS_SERVER,
  IS_DEVELOPMENT,
  REACT_AXE,
  CONFIG_FILE
} from "../utils/env";
import getPathFor from "../utils/getPathFor";
import UrlShortener from "../UrlShortener";
import getOrCreateStore from "../dataflow/getOrCreateStore";
import { LibraryData, AppConfigFile } from "../interfaces";
import { ThemeProvider } from "theme-ui";
import Auth from "../components/Auth";
import ErrorBoundary from "../components/ErrorBoundary";
import Head from "next/head";
import Error from "components/Error";
import { ParsedUrlQuery } from "querystring";
import enableAxe from "utils/axe";
import "system-font-css";
import "@nypl/design-system-react-components/dist/styles.css";
import "css-overrides.css";
import makeTheme from "../theme";
import {
  getCatalogUrl,
  fetchCatalog,
  getAuthDocHref,
  fetchAuthDocument,
  getLibraryData
} from "dataflow/getLibraryData";
import getConfigFile from "dataflow/getConfigFile";
import ApplicationError from "errors";

type ErrorProps = {
  error: {
    message: string;
    name: string;
    statusCode: number;
  };
  configFile?: AppConfigFile;
};

type MyAppProps =
  | {
      library: LibraryData;
    }
  | ErrorProps;

function isErrorProps(props: MyAppProps): props is ErrorProps {
  return !!(props as ErrorProps).error;
}

const MyApp = (props: MyAppProps & AppProps) => {
  /**
   * If there was no library or initialState provided, render the error page
   */

  if (isErrorProps(props)) {
    return (
      <Error
        statusCode={props.error.statusCode}
        detail={props.error.message}
        configFile={props.configFile}
      />
    );
  }

  const { library, Component, pageProps } = props;
  const urlShortener = new UrlShortener(library.catalogUrl, SHORTEN_URLS);
  const pathFor = getPathFor(urlShortener, library.id);
  const store = getOrCreateStore(pathFor);

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

MyApp.getInitialProps = async ({ ctx, _err }) => {
  const librarySlug = getLibraryFromQuery(ctx.query);

  try {
    const catalogUrl = await getCatalogUrl(librarySlug);
    const catalog = await fetchCatalog(catalogUrl);
    const authDocHref = getAuthDocHref(catalog);
    const authDocument = await fetchAuthDocument(authDocHref);
    const library = getLibraryData(authDocument, catalogUrl, librarySlug);

    return {
      library
    };
  } catch (e) {
    let configFile: AppConfigFile | undefined;
    if (CONFIG_FILE) {
      try {
        configFile = await getConfigFile(CONFIG_FILE);
      } catch {
        configFile = undefined;
      }
    }

    if (e instanceof ApplicationError) {
      return {
        error: {
          message: e.message,
          name: e.name,
          statusCode: e.statusCode
        },
        configFile
      };
    }
    // otherwise it is probably not recoverable
    throw e;
  }
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
