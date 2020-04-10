import {
  isServer,
  __LIBRARY_DATA__,
  CACHE_EXPIRATION_SECONDS
} from "./../utils/env";
import { LibraryData } from "./../interfaces";
import LibraryDataCache from "./LibraryDataCache";
import {
  REGISTRY_BASE,
  CIRCULATION_MANAGER_BASE,
  CONFIG_FILE
} from "../utils/env";
import fs from "fs";

async function setupCache() {
  if (
    (REGISTRY_BASE && CIRCULATION_MANAGER_BASE) ||
    (REGISTRY_BASE && CONFIG_FILE) ||
    (CIRCULATION_MANAGER_BASE && CONFIG_FILE)
  ) {
    console.error(
      "Only one of REGISTRY_BASE, SIMPLIFIED_CATALOG_BASE, and CONFIG_FILE should be used."
    );
  }
  if (REGISTRY_BASE) {
    console.log("Running with Library Registry at: ", REGISTRY_BASE);
    return new LibraryDataCache(REGISTRY_BASE, 10);
  }

  if (CONFIG_FILE) {
    console.log("Running with Config file at: ", CONFIG_FILE);
    let configText: string | null;
    const config = {};
    // it is a remote config file.
    if (CONFIG_FILE.startsWith("http")) {
      try {
        const configResponse = await fetch(CONFIG_FILE);
        configText = await configResponse.text();
      } catch (configUrlError) {
        throw "Could not read config file at " + CONFIG_FILE;
      }
      // it is a local config file.
    } else {
      configText = fs.readFileSync(CONFIG_FILE, "utf8");
    }
    // read the entries.
    for (const entry of configText.split("\n")) {
      if (entry && entry.charAt(0) !== "#") {
        const [path, circManagerUrl] = entry.split("|");
        config[path] = circManagerUrl;
      }
    }
    return new LibraryDataCache(undefined, 10, config);
  }

  if (CIRCULATION_MANAGER_BASE) {
    console.log(
      "Running with Circulation Manager Base at: ",
      CIRCULATION_MANAGER_BASE
    );
    return new LibraryDataCache(undefined, 10, {});
  }

  console.log(
    "No env vars found, setting registry base to http://localhost:7000"
  );
  return new LibraryDataCache(
    "http://localhost:7000",
    CACHE_EXPIRATION_SECONDS
  );
}

// the cache should only be created once per server instance.
const cachePromise = setupCache();

/**
 * 1. First page load:
 *  - on server: fetch library data, pass it down tree and render.
 *  - on client: receive library data from server, set it on window and render
 * 2. On following client route transitions:
 *  - on client: _app rerenders and calls getInitialProps again. we don't
 *    want to fetch libraryData on every page transition, so we reuse the
 *    info that was previously saved on window.
 */
export const setLibraryData = (library: LibraryData) => {
  if (isServer) return;
  window[__LIBRARY_DATA__] = library;
};

/**
 * will get the library data from the window when we are
 * on the client, otherwise it will fetch it via the api
 */
const getLibraryData = async (): Promise<LibraryData> => {
  if (isServer) {
    return fetchLibraryData();
  }
  /**
   * we are on the client and library data should be available
   * on the window, but if it's not for some reason then fetch it.
   */
  if (!window[__LIBRARY_DATA__]) {
    const data = await fetchLibraryData();
    window[__LIBRARY_DATA__] = data;
  }
  // return our cached store
  return window[__LIBRARY_DATA__];
};

/**
 * uses the datacache to get library data
 * handles the logic around config files and env vars
 */
const fetchLibraryData = async (): Promise<LibraryData> => {
  console.log("Fetching library data");

  // first make sure the cache is ready
  const cache = await cachePromise;

  if (!CIRCULATION_MANAGER_BASE) {
    // we currently only support when there is a CIRCULATION_MANAGER_BASE.
    // this will need to be updated for production
    throw new Error("You must have a CIRCULATION_MANAGER_BASE set");
  }
  // We're using a single circ manager library instead of a registry.
  const catalog = await cache.getCatalog(CIRCULATION_MANAGER_BASE);
  const authDocument = await cache.getAuthDocument(catalog);
  const libraryData = {
    onlyLibrary: true,
    catalogUrl: CIRCULATION_MANAGER_BASE,
    ...cache.getDataFromAuthDocumentAndCatalog(authDocument, catalog)
  };

  return libraryData;
};

export default getLibraryData;
