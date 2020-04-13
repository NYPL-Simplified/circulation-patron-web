import * as React from "react";
import * as express from "express";
import UrlShortener from "../../UrlShortener";
import buildInitialState from "opds-web-client/lib/state";
import { renderToString } from "react-dom/server";
import ContextProvider from "../../components/context/ContextProvider";
import { LibraryData } from "../../interfaces";
import renderErrorPage from "./renderErrorPage";
import getAssets from "./getAssets";
import Html, { DOCTYPE } from "./html";
import { matchPath, StaticRouter, RouteProps } from "react-router-dom";
import App from "../../App";
import LibraryDataCache from "../LibraryDataCache";

type Url = string;

type Params = {
  library?: string;
  collectionUrl?: Url;
  bookUrl?: Url;
};

type SSRProps = {
  routes: RouteProps[];
  cache: LibraryDataCache;
  shortenUrls: boolean;
  circManagerBase: string | undefined;
};

/**
 * A function that takes in library data and returns a function to
 * render html from the request.
 *
 *  - match with a route
 *  - handle 404s, redirects
 *  - get library data
 *  - build initial state
 *  - render the html and send it
 *  - handle errors
 *
 * Possibilities:
 *  - no url match
 *  - no params on url
 *  - can't get library data from cache
 *  - no collectionUrl or bookUrl, we need to redirect
 *  - app renders a redirect itself
 *  - building the page fails
 */

const ssr = ({
  shortenUrls,
  cache,
  routes,
  circManagerBase
}: SSRProps) => async (req: express.Request, res: express.Response) => {
  // try to match the page and build it
  try {
    // match with the central route config
    // let match: Match<Params> | null = null;
    const matchedRoute = routes.find(route => {
      const doesMatch = matchPath<Params>(req.url, route);
      if (doesMatch) {
        return route;
      }
      return false;
    });
    // if there is no active route, render the home page
    if (!matchedRoute) {
      console.error("No route match was found for ", req.url);
      res.redirect(302, "/");
      return;
    }
    const match = matchPath<Params>(req.url, matchedRoute);

    // otherwise, use the params to get the data, then render.
    // accessing these with typscript optional chaining.
    const library = match?.params?.library;
    const collectionUrl = match?.params?.collectionUrl;
    const bookUrl = match?.params?.bookUrl;
    /**
     * Build out libraryData
     * Send 404 if we fail to get it from the cache
     */
    let libraryData: Omit<LibraryData, "id">;
    if (circManagerBase) {
      // We're using a single circ manager library instead of a registry.
      const catalog = await cache.getCatalog(circManagerBase);
      const authDocument = await cache.getAuthDocument(catalog);
      const authDocAndCat = cache.getDataFromAuthDocumentAndCatalog(
        authDocument,
        catalog
      );

      libraryData = {
        onlyLibrary: true,
        catalogUrl: circManagerBase,
        ...authDocAndCat,
        logoUrl: authDocAndCat.logoUrl ?? undefined
      };
    } else {
      try {
        if (library) {
          libraryData = await cache.getLibraryData(library);
        } else {
          console.error("No library defined");
          res.status(404).send(renderErrorPage());
          return;
        }
      } catch (error) {
        console.error("Could not get library data from cache", error);
        res.status(404).send(renderErrorPage(error));
        return;
      }
    }
    const catalogUrl = libraryData.catalogUrl;
    const urlShortener = new UrlShortener(catalogUrl, shortenUrls);

    /**
     * Redirect if there is neither a collectionUrl or a bookUrl
     */
    if (!collectionUrl && !bookUrl) {
      const preparedCollectionUrl = urlShortener.prepareCollectionUrl(
        catalogUrl
      );
      // With short URLS, if the home URL is the library root URL, the prepared URL
      // will be empty, and we don't need to redirect.
      if (!shortenUrls || preparedCollectionUrl) {
        if (library) {
          res.redirect(
            302,
            "/" + library + "/collection/" + preparedCollectionUrl
          );
        } else {
          res.redirect(302, "/collection/" + preparedCollectionUrl);
        }
        return;
      }
    }
    // we need to expand the bookUrl before making a request to it, otherwise
    // we get an error
    const fullBookUrl = urlShortener.expandBookUrl(bookUrl);
    /**
     * Try to build the page and send it. If that fails, build try building
     * the root of the catalog and sending that instead. To build the root,
     * pass undefined as collectionUrl and fullBookUrl.
     */
    try {
      const fullPage = await buildPage(
        collectionUrl,
        fullBookUrl,
        libraryData,
        shortenUrls,
        req,
        res
      );
      res.status(200).send(fullPage);
    } catch (e) {
      const rootPage = await buildPage(
        undefined,
        undefined,
        libraryData,
        shortenUrls,
        req,
        res
      );
      res.status(200).send(rootPage);
    }
  } catch (error) {
    console.error("Could not SSR");
    console.error(error);
    res.status(500).send(renderErrorPage());
  }
};

const buildPage = async (
  collectionUrl: Url | undefined,
  bookUrl: Url | undefined,
  libraryData: LibraryData,
  shortenUrls,
  req: express.Request,
  res: express.Response
) => {
  const state = await buildInitialState(collectionUrl, bookUrl);

  const assets = await getAssets(res);

  const context = {};

  const helmetContext = {};

  const htmlContent: string = renderToString(
    <StaticRouter location={req.url} context={context}>
      <ContextProvider
        library={libraryData}
        shortenUrls={shortenUrls}
        initialState={state}
        helmetContext={helmetContext}
      >
        <App />
      </ContextProvider>
    </StaticRouter>
  );

  return (
    DOCTYPE +
    "\n" +
    renderToString(
      React.createElement(Html, {
        content: htmlContent,
        library: libraryData,
        preloadedState: state,
        shortenUrls,
        assets,
        helmetContext
      })
    )
  );
};

export default ssr;
