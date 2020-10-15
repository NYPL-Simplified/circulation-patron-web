/* eslint-disable no-underscore-dangle */

/**
 * Simply exporting processed env vars
 */

export const CONFIG_FILE = process.env.CONFIG_FILE;
export const REACT_AXE = process.env.REACT_AXE;
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_SERVER = typeof window === "undefined";
export const APP_VERSION = process.env.APP_VERSION;
export const AXISNOW_DECRYPT = process.env.NEXT_PUBLIC_AXISNOW_DECRYPT;
