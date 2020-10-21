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
    // mock the config file
    config.resolve.alias['config'] = require.resolve('./config-mock.ts');
    // mock SWR
    config.resolve.alias['swr'] = require.resolve("./swr-mock.tsx");

    config.resolve.modules = [
      path.resolve(__dirname, "../src"),
      "node_modules"
    ]

    return config
  }
}