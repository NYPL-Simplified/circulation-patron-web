import { defaultMock } from "../src/test-utils/mockConfig"


export let APP_CONFIG = defaultMock;

// the decorator to be used in ./storybook/preview to apply the mock to all stories

export function configDecorator(story: any, { parameters, globals }) {
  if (parameters && parameters.config) {
    APP_CONFIG = {
      ...defaultMock,
      ...parameters.config,
    }
  }
  APP_CONFIG.companionApp = globals.companionApp;
  APP_CONFIG.showMedium = globals.showMedium; 
  return story();  
}