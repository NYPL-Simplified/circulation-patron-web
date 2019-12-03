import "../ignore_stylesheet_imports";
import * as express from "express";
import * as React from "react";
const fs = require("fs");
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import { singleLibraryRoutes, multiLibraryRoutes } from "../routes";
import ContextProvider from "../components/ContextProvider";
import buildInitialState, { State } from "opds-web-client/lib/state";
import LibraryDataCache from "./LibraryDataCache";
import UrlShortener from "../UrlShortener";
import { LibraryData } from "../interfaces";

const initialize = async () => {
  const app = express();
  const port = process.env.PORT || 3000;

  let registryBase = process.env.REGISTRY_BASE;

  const circManagerBase = process.env.SIMPLIFIED_CATALOG_BASE;
  let routes = circManagerBase ? singleLibraryRoutes : multiLibraryRoutes;

  const config = {};
  const configFile = process.env.CONFIG_FILE;

  if (configFile) {
    let configText;
    if (configFile.startsWith("http")) {
      try {
        const configResponse = await fetch(configFile);
        configText = await configResponse.text();
      } catch (configUrlError) {
        throw "Could not read config file at " + configFile;
      }
    } else {
      configText = fs.readFileSync(configFile, "utf8");
    }
    for (let entry of configText.split("\n")) {
      if (entry && entry.charAt(0) !== "#") {
        let [path, circManagerUrl] = entry.split("|");
        config[path] = circManagerUrl;
      }
    }
  }

  if (
    (registryBase && circManagerBase) ||
    (registryBase && configFile) ||
    (circManagerBase && configFile)
  ) {
    console.warn(
      "Only one of REGISTRY_BASE, SIMPLIFIED_CATALOG_BASE, and CONFIG_FILE should be used."
    );
  }

  if (!registryBase && !circManagerBase && !configFile) {
    registryBase = "http://localhost:7000";
  }

  const shortenUrls: boolean = !(process.env.SHORTEN_URLS === "false");

  const distDir = process.env.SIMPLIFIED_PATRON_DIST || "dist";
  const cacheExpirationSeconds = parseInt(
    process.env.CACHE_EXPIRATION_SECONDS,
    10
  );
  const cache = new LibraryDataCache(
    registryBase,
    cacheExpirationSeconds,
    config
  );

  // This is fired every time the server side receives a request
  app.use("/js", express.static(distDir));
  app.use("/css", express.static(distDir));
  app.use(handleRender);

  function handleRender(req, res) {
    match(
      { routes, location: req.url },
      async (error, redirectLocation, renderProps: any) => {
        if (error) {
          res.status(500).send(renderErrorPage());
        } else if (redirectLocation) {
          res.redirect(
            302,
            redirectLocation.pathname + redirectLocation.search
          );
        } else if (renderProps) {
          let { library, collectionUrl, bookUrl } = renderProps.params;

          let libraryData;
          if (circManagerBase) {
            // We're using a single circ manager library instead of a registry.
            let catalog = await cache.getCatalog(circManagerBase);
            let authDocument = await cache.getAuthDocument(catalog);
            libraryData = {
              onlyLibrary: true,
              catalogUrl: circManagerBase,
              ...cache.getDataFromAuthDocumentAndCatalog(authDocument, catalog)
            };
          } else {
            try {
              libraryData = await cache.getLibraryData(library);
            } catch (error) {
              res.status(404).send(renderErrorPage(error));
              return;
            }
          }
          let catalogUrl = libraryData.catalogUrl;

          if (!collectionUrl && !bookUrl) {
            let urlShortener = new UrlShortener(catalogUrl, shortenUrls);
            let preparedCollectionUrl = urlShortener.prepareCollectionUrl(
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

          buildInitialState(collectionUrl, bookUrl)
            .then((state: State) => {
              const html = renderToString(
                <ContextProvider
                  library={libraryData}
                  shortenUrls={shortenUrls}
                  initialState={state}
                >
                  <RouterContext {...renderProps} />
                </ContextProvider>
              );

              res.status(200).send(renderFullPage(html, libraryData, state));
            })
            .catch(err => {
              // if error, render catalog root
              buildInitialState(null, null)
                .then((state: State) => {
                  const html = renderToString(
                    <ContextProvider
                      library={libraryData}
                      shortenUrls={shortenUrls}
                      initialState={state}
                    >
                      <RouterContext {...renderProps} />
                    </ContextProvider>
                  );

                  res
                    .status(200)
                    .send(renderFullPage(html, libraryData, state));
                })
                .catch(err => res.status(500).send(renderErrorPage()));
            });
        } else {
          res.status(404).send(renderErrorPage("This page doesn't exist."));
        }
      }
    );
  }

  function renderFullPage(
    html: string,
    library: LibraryData,
    preloadedState: State
  ) {
    let collectionTitle =
      preloadedState.collection &&
      preloadedState.collection.data &&
      preloadedState.collection.data.title;
    let bookTitle =
      preloadedState.book &&
      preloadedState.book.data &&
      preloadedState.book.data.title;
    let details = bookTitle || collectionTitle;
    let pageTitle = library.catalogName + (details ? " - " + details : "");

    return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>${pageTitle}</title>
          <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
          <link href="/css/CirculationPatronWeb.css" rel="stylesheet" crossorigin="anonymous">
          ${library.cssLinks
            .map(link => {
              return `<link href="${link.href}" rel="${link.rel}" crossorigin="anonymous">`;
            })
            .join("\n")}
        </head>
        <body>
          <div id="circulation-patron-web">${html}</div>
          <script src="/js/CirculationPatronWeb.js"></script>
          <script>
            var circulationPatronWeb = new CirculationPatronWeb({
              library: ${JSON.stringify(library)},
              shortenUrls: ${shortenUrls},
              initialState: ${JSON.stringify(preloadedState)}
            });
          </script>
        </body>
      </html>
      `;
  }

  function renderErrorPage(
    message: string = "There was a problem with this request."
  ) {
    return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>Error</title>
          <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        </head>
        <body>
          <div style="text-align: center; margin-top: 200px;">
            <h1>${message}</h1>
            <br />
            <h3><a class="btn btn-lg btn-primary" href="/">Home Page</a></h3>
          </div>
        </body>
      </html>
      `;
  }

  app.listen(port, function() {
    console.log("Server listening on port " + port);
  });
};
initialize();
