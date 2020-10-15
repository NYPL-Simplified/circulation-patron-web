const withTM = require("next-transpile-modules")([
  "library-simplified-webpub-viewer"
]);
const {
  BugsnagBuildReporterPlugin,
  BugsnagSourceMapUploaderPlugin
} = require("webpack-bugsnag-plugins");
const path = require("path");

const APP_VERSION = require("./package.json").version;

const config = {
  env: {
    CONFIG_FILE: process.env.CONFIG_FILE,
    REACT_AXE: process.env.REACT_AXE,
    APP_VERSION
  },
  webpack: (config, { _buildId, dev, isServer, _defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    !isServer && config.plugins.push(new webpack.IgnorePlugin(/jsdom$/));
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

    // stub out the axisnow decryptor if we don't have access to it
    if (process.env.NEXT_PUBLIC_AXISNOW_DECRYPT === "true") {
      console.log("Running with AxisNow Decryption");
      // make sure it works so we fail at build time if it's not there
      try {
        const _Decryptor = require("@nypl/axisnow-access-control-web");
      } catch (e) {
        throw new Error(
          "Failed to require @nypl/axisnow-access-control-web. Make sure you have access, or run the app without the NEXT_PUBLIC_AXISNOW_ACCESS_CONTROL_WEB environment variable.",
          e
        );
      }
    } else {
      config.resolve.alias["@nypl/axisnow-access-control-web"] = path.resolve(
        __dirname,
        "src/utils/stub-decryptor"
      );
    }

    // add bugsnag if we are not in dev
    if (!dev && process.env.NEXT_PUBLIC_BUGSNAG_API_KEY) {
      const config = {
        apiKey: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
        appVersion: APP_VERSION
      };
      config.plugins.push(new BugsnagBuildReporterPlugin(config));
      config.plugins.push(new BugsnagSourceMapUploaderPlugin(config));
    }

    // source the app config file and provide it using val-loader
    config.module.rules.push({
      test: require.resolve("./src/config/load-config.js"),
      use: [{ loader: "val-loader" }]
    });

    return config;
  }
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});
module.exports = withTM(withBundleAnalyzer(config));
