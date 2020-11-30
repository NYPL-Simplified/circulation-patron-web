import path from "path"

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: async config => {
    config.resolve.alias['core-js/modules'] = '@storybook/core/node_modules/core-js/modules';
    config.resolve.alias['core-js/features'] = '@storybook/core/node_modules/core-js/features';
    // mock SWR
    config.resolve.alias['swr'] = require.resolve("./swr-mock.tsx");
    // mock our env vars so they can be updated via the toolbar
    config.resolve.alias['utils/env'] = require.resolve("./env-mock.ts");

    config.resolve.modules = [
      path.resolve(__dirname, "../src"),
      "node_modules"
    ]
    
    return config
  },
  refs: {
    'nypl-design-system': {
      title: "NYPL Design System",
      url: "https://nypl.github.io/nypl-design-system/storybook-static/"
    }
  }
}