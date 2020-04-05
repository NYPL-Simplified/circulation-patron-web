import React from "react";
import { AppProps } from "next/app";
import ContextProvider from "../components/context/ContextProvider";
import { shortenUrls, isServer, isDevelopment } from "../utils/env";
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
import Helmet from "react-helmet";
import Head from "next/head";

const MyApp = ({
  Component,
  pageProps,
  library,
  initialState
}: AppProps & {
  library: LibraryData;
  initialState: State;
}) => {
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

MyApp.getInitialProps = async appContext => {
  isServer
    ? console.log("Running _app getInitialProps on server")
    : console.log("Running _app getInitialProps on client");

  /**
   * Get libraryData from the DataCache, which we will then set
   * in the redux store. We need to augment this for settings
   *  CONFIG_FILE
   *  LIBRARY_REGISTRY
   */
  const libraryData = await getLibraryData();

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
if (isDevelopment && !isServer) {
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
