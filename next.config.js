const withTM = require("next-transpile-modules")([
  "library-simplified-webpub-viewer"
]);
const {
  BugsnagBuildReporterPlugin,
  BugsnagSourceMapUploaderPlugin
} = require("webpack-bugsnag-plugins");
const Git = require("nodegit");
const APP_VERSION = require("./package.json").version;
const generateConfig = require("./src/config/get-config.js");

// get the app config
const APP_CONFIG = generateConfig(process.env.CONFIG_FILE);

/**
 * Set the AXISNOW_DECRYPT variable based on whether the package is available.
 */
let AXISNOW_DECRYPT = false;
try {
  const Decryptor = require("@nypl-simplified-packages/axisnow-access-control-web");
  if (Decryptor) AXISNOW_DECRYPT = true;
  console.log("AxisNow Decryptor is available.");
} catch (e) {
  console.log("AxisNow Decryptor is not available.");
}

const config = {
  env: {
    CONFIG_FILE: process.env.CONFIG_FILE,
    REACT_AXE: process.env.REACT_AXE,
    APP_VERSION,
    AXISNOW_DECRYPT
  },
  generateBuildId: async () => {
    return await Git.Repository.open(".")
      .then(repo => {
        return repo.getHeadCommit();
      })
      .then(commit => {
        return commit.sha();
      });
  },
  webpack: (config, { _buildId, dev, isServer, _defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config

    // provide the app config as a global
    config.plugins.push(
      new webpack.DefinePlugin({
        APP_CONFIG: JSON.stringify(APP_CONFIG)
      })
    );

    // react-axe should only be bundled when REACT_AXE=true
    !process.env.REACT_AXE &&
      config.plugins.push(new webpack.IgnorePlugin(/react-axe$/));
    // Fixes dependency on "fs" module.
    // we don't (and can't) depend on this in client-side code.
    if (!isServer) {
      config.node = {
        fs: "empty"
      };
    }

    // add bugsnag if we are not in dev
    if (!dev && APP_CONFIG.bugsnagApiKey) {
      const config = {
        apiKey: APP_CONFIG.bugsnagApiKey,
        appVersion: APP_VERSION
      };
      config.plugins.push(new BugsnagBuildReporterPlugin(config));
      config.plugins.push(new BugsnagSourceMapUploaderPlugin(config));
    }

    // source the app config file and provide it using val-loader
    // config.module.rules.push({
    //   test: require.resolve("./src/config/load-config.js"),
    //   use: [{ loader: "val-loader" }]
    // });

    // ignore the axisnow decryptor if we don't have access
    if (!AXISNOW_DECRYPT) {
      console.log("Building without AxisNow Decryption");
      config.plugins.push(
        new webpack.IgnorePlugin(
          /@nypl-simplified-packages\/axisnow-access-control-web/
        )
      );
    } else {
      console.log("Building with AxisNow Decryption");
    }

    return config;
  }
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});
module.exports = withTM(withBundleAnalyzer(config));
