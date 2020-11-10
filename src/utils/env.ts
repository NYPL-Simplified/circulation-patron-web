import { AppSetupError } from "errors";
/* eslint-disable no-underscore-dangle */

import { AppConfig } from "interfaces";

/**
 * Simply exporting processed env vars
 */

export const CONFIG_FILE = process.env.CONFIG_FILE;

const appConfigString = process.env.APP_CONFIG;
if (!appConfigString)
  throw new AppSetupError("process.env.APP_CONFIG is undefined.");
export const APP_CONFIG: AppConfig = JSON.parse(appConfigString);

export const REACT_AXE = process.env.REACT_AXE;
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const NODE_ENV = process.env.NODE_ENV;
export const IS_SERVER = typeof window === "undefined";
export const APP_VERSION = process.env.APP_VERSION;
export const BUILD_ID = process.env.BUILD_ID;
export const GIT_COMMIT_SHA = process.env.GIT_COMMIT_SHA;
export const GIT_BRANCH = process.env.GIT_BRANCH;
export const AXISNOW_DECRYPT = process.env.AXISNOW_DECRYPT;
export const RELEASE_STAGE = process.env.RELEASE_STAGE;
