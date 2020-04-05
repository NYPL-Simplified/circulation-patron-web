/**
 * Simply exporting processed env vars
 */
export const shortenUrls = !(process.env.SHORTEN_URLS === "false");
export const registryBase = process.env.REGISTRY_BASE;
export const circManagerBase = process.env.SIMPLIFIED_CATALOG_BASE;
export const isDevelopment = process.env.NODE_ENV === "development";
export const isServer = typeof window === "undefined";

// where the redux store is kept on window
export const __NEXT_REDUX_STORE__ = "__NEXT_REDUX_STORE__";
// where we store the library data
export const __LIBRARY_DATA__ = "__LIBRARY_DATA__";
