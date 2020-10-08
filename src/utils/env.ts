/* eslint-disable no-underscore-dangle */

/**
 * Simply exporting processed env vars
 */

export const REGISTRY_BASE = process.env.REGISTRY_BASE;
export const CIRCULATION_MANAGER_BASE = process.env.SIMPLIFIED_CATALOG_BASE;
export const CONFIG_FILE = process.env.CONFIG_FILE;
export const REACT_AXE = process.env.REACT_AXE;
// if there is not circ manager base, we are using multi library routes
export const IS_MULTI_LIBRARY = !CIRCULATION_MANAGER_BASE;
export const CACHE_EXPIRATION_SECONDS = parseInt(
  process.env.CACHE_EXPIRATION_SECONDS ?? "10",
  10
);
export const NEXT_PUBLIC_AXIS_NOW_DECRYPT =
  process.env.NEXT_PUBLIC_AXIS_NOW_DECRYPT === "true";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_SERVER = typeof window === "undefined";

export const APP_VERSION = process.env.APP_VERSION;
