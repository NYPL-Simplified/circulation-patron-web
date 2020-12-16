import { config } from "../src/test-utils/fixtures/config"
/**
 * These will be all undefined, but they need to be
 * exported anyways.
 */
export const CONFIG_FILE = process.env.CONFIG_FILE;
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

/**
 * This is the one we will modify via the toolbar
 */
export let APP_CONFIG = config;

// the decorator to be used in ./storybook/preview to apply the mock to all stories

export function envDecorator(story: any, { globals }) {
  APP_CONFIG.companionApp = globals.companionApp;
  APP_CONFIG.showMedium = globals.showMedium; 
  return story();  
}