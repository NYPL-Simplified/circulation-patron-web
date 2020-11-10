import { config } from "../src/test-utils/fixtures/config"


export let APP_CONFIG = config;

// the decorator to be used in ./storybook/preview to apply the mock to all stories

export function configDecorator(story: any, { parameters, globals }) {
  if (parameters && parameters.config) {
    APP_CONFIG = {
      ...config,
      ...parameters.config,
    }
  }
  APP_CONFIG.companionApp = globals.companionApp;
  APP_CONFIG.showMedium = globals.showMedium; 
  return story();  
}