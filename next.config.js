const withTM = require("next-transpile-modules")([
  "library-simplified-webpub-viewer"
]);
const {
  BugsnagBuildReporterPlugin,
  BugsnagSourceMapUploaderPlugin
} = require("webpack-bugsnag-plugins");

const APP_VERSION = require("./package.json").version;

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
