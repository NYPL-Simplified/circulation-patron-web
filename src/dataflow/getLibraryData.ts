/* eslint-disable no-underscore-dangle */
import { LibraryData } from "./../interfaces";
import LibraryDataCache from "./LibraryDataCache";
import {
  IS_SERVER,
  __LIBRARY_DATA__,
  CACHE_EXPIRATION_SECONDS,
  REGISTRY_BASE,
  CIRCULATION_MANAGER_BASE,
  CONFIG_FILE
} from "../utils/env";
import fs from "fs";

async function setupCache() {
  // we don't want this to be run on the client
  if (!IS_SERVER) return Promise.resolve(null);

  if (
    (REGISTRY_BASE && CIRCULATION_MANAGER_BASE) ||
    (REGISTRY_BASE && CONFIG_FILE) ||
    (CIRCULATION_MANAGER_BASE && CONFIG_FILE)
  ) {
    console.error(
      "Only one of REGISTRY_BASE, SIMPLIFIED_CATALOG_BASE, and CONFIG_FILE should be used.",
      REGISTRY_BASE,
      CIRCULATION_MANAGER_BASE,
      CONFIG_FILE
    );
  }
  if (REGISTRY_BASE) {
    console.log("Running with Library Registry at: ", REGISTRY_BASE);
    return new LibraryDataCache(REGISTRY_BASE, CACHE_EXPIRATION_SECONDS);
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
    return new LibraryDataCache(undefined, CACHE_EXPIRATION_SECONDS, config);
  }

  if (CIRCULATION_MANAGER_BASE) {
    console.log(
      "Running with Circulation Manager Base at: ",
      CIRCULATION_MANAGER_BASE
    );
    // when running with a single circ manager, you pass no library
    // registry and an empty config object.
    return new LibraryDataCache(undefined, CACHE_EXPIRATION_SECONDS, {});
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
  if (IS_SERVER) return;
  window[__LIBRARY_DATA__] = library;
};

/**
 * Get the library data from the window when we are
 * on the client, otherwise fetch it via the api
 */
const getLibraryData = async (
  library?: string
): Promise<LibraryData | null> => {
  if (IS_SERVER) {
    return await fetchLibraryData(library);
  }
  /**
   * we are on the client and library data should be available
   * on the window. If it is not, something has gone wrong and we should
   * trigger a re-render from the server or display an error page.
   * We cannot fetch library data on client because it depends on
   * reading the config file on server with "fs" module.
   */
  return Promise.resolve(window[__LIBRARY_DATA__]);
};

/**
 * uses the datacache to get library data
 * handles the logic around config files and env vars
 */
const fetchLibraryData = async (
  library?: string
): Promise<LibraryData | null> => {
  // first make sure the cache is ready
  const cache = await cachePromise;

  // if the cache is not loaded, we are client side and can't proceed.
  if (!cache) {
    throw new Error("Cannot fetch library data on client");
  }

  if (CIRCULATION_MANAGER_BASE) {
    // We're using a single circ manager library instead of a registry.
    const catalog = await cache.getCatalog(CIRCULATION_MANAGER_BASE);
    const authDocument = await cache.getAuthDocument(catalog);
    const libraryData = {
      onlyLibrary: true,
      catalogUrl: CIRCULATION_MANAGER_BASE,
      ...cache.getDataFromAuthDocumentAndCatalog(authDocument, catalog)
    };

    return libraryData;
  }
  // otherwise we are using a config file or registry.
  if (library) {
    return await cache.getLibraryData(library);
  }
  console.error("Running with multiple libraries and no library was provided!");
  // otherwise there was no library provided, return null
  return null;
};

export default getLibraryData;
