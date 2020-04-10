/**
 * Simply exporting processed env vars
 */
export const shortenUrls = !(process.env.SHORTEN_URLS === "false");
export const REGISTRY_BASE = process.env.REGISTRY_BASE;
export const CIRCULATION_MANAGER_BASE = process.env.SIMPLIFIED_CATALOG_BASE;
export const CONFIG_FILE = process.env.CONFIG_FILE;
export const REACT_AXE = process.env.REACT_AXE;
export const CACHE_EXPIRATION_SECONDS = parseInt(
  process.env.CACHE_EXPIRATION_SECONDS ?? "10",
  10
);
export const isDevelopment = process.env.NODE_ENV === "development";
export const isServer = typeof window === "undefined";

// where the redux store is kept on window
export const __NEXT_REDUX_STORE__ = "__NEXT_REDUX_STORE__";
// where we store the library data
export const __LIBRARY_DATA__ = "__LIBRARY_DATA__";
