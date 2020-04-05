import { isServer, __LIBRARY_DATA__ } from "./../utils/env";
import { LibraryData } from "./../interfaces";
import LibraryDataCache from "../server/LibraryDataCache";
import { registryBase, circManagerBase } from "../utils/env";

const cache = new LibraryDataCache(registryBase, 10);

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
  /**
   * Different options for libraries
   *  - single circulation manager base
   *  - config file
   *  - registry base
   *  - multiple libraries?
   */

  if (!circManagerBase) {
    // we currently only support when there is a circManagerBase.
    // this will need to be updated for production
    throw new Error("You must have a CIRCULATION_MANAGER_BASE set");
  }
  // We're using a single circ manager library instead of a registry.
  const catalog = await cache.getCatalog(circManagerBase);
  const authDocument = await cache.getAuthDocument(catalog);
  const libraryData = {
    onlyLibrary: true,
    catalogUrl: circManagerBase,
    ...cache.getDataFromAuthDocumentAndCatalog(authDocument, catalog)
  };

  return libraryData;
};

export default getLibraryData;
