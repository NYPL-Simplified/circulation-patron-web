import React from "react";
import { AppProps } from "next/app";
import ContextProvider from "../components/context/ContextProvider";
import { shortenUrls, isServer, isDevelopment, REACT_AXE } from "../utils/env";
import getPathFor from "../utils/getPathFor";
import UrlShortener from "../UrlShortener";
import getLibraryData, { setLibraryData } from "../dataflow/getLibraryData";
import getOrCreateStore from "../dataflow/getOrCreateStore";
import { LibraryData } from "../interfaces";
import { State } from "opds-web-client/lib/state";
import { ThemeProvider } from "theme-ui";
import theme from "../theme";
import Auth from "../components/Auth";
import Layout from "../components/Layout";
import ErrorBoundary from "../components/ErrorBoundary";
import Head from "next/head";
import Error from "next/error";
import { NextPage } from "next";
import { ParsedUrlQuery } from "querystring";

type NotFoundProps = {
  statusCode: number;
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
    return <Error statusCode={props.statusCode} />;
  }

  const { library, initialState, Component, pageProps } = props;

  const urlShortener = new UrlShortener(library.catalogUrl, shortenUrls);
  const pathFor = getPathFor(urlShortener, library.id);
  const store = getOrCreateStore(pathFor, initialState);
  setLibraryData(library);
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <Head>
        {/* define the default title */}
        <title>Library.catalogName</title>
      </Head>
      <ContextProvider
        shortenUrls={shortenUrls}
        library={library}
        store={store}
      >
        <ThemeProvider theme={theme}>
          <Auth>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Auth>
        </ThemeProvider>
      </ContextProvider>
    </ErrorBoundary>
  );
};

/**
 * The query object type doesn't protect against undefined values, and
 * the "library" variable could be an array if you pass ?library=xxx&library=zzz
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

MyApp.getInitialProps = async ({ ctx, err }) => {
  isServer
    ? console.log("Running _app getInitialProps on server")
    : console.log("Running _app getInitialProps on client");
  console.log(ctx);
  const { query } = ctx;

  /**
   * Get libraryData from the DataCache, which we will then set
   * in the redux store. We need to augment this for settings
   *  CONFIG_FILE
   *  LIBRARY_REGISTRY
   */
  const parsedLibrary = getLibraryFromQuery(query);
  console.log("Library is ", query);
  const libraryData = await getLibraryData(parsedLibrary);

  if (!libraryData) return { statusCode: 404 };

  /**
   * Create the resources we need to complete a server render
   */
  const urlShortener = new UrlShortener(libraryData.catalogUrl, shortenUrls);
  const pathFor = getPathFor(urlShortener, libraryData.id);
  const store = getOrCreateStore(pathFor);

  /**
   * Pass updated redux state to the app component to be used to rebuild
   * the store on client side with pre-filled data from ssr
   */
  const initialState = store.getState();

  return {
    initialState,
    shortenUrls,
    pathFor,
    library: libraryData
  };
};

/**
 * Accessibility tool - outputs to devtools console on dev only and client-side only.
 * @see https://github.com/dequelabs/react-axe
 */
if (isDevelopment && !isServer && REACT_AXE) {
  const ReactDOM = require("react-dom");
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000);
}

const AppErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div>
      <p sx={{ textAlign: "center" }}>{message}</p>
    </div>
  );
};

export default MyApp;
