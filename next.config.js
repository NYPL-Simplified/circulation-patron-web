const withTM = require("next-transpile-modules")([
  "library-simplified-webpub-viewer"
]);
const {
  BugsnagBuildReporterPlugin,
  BugsnagSourceMapUploaderPlugin
} = require("webpack-bugsnag-plugins");
const withSourceMaps = require("@zeit/next-source-maps");
const APP_VERSION = require("./package.json").version;

// get the latest Git commit sha
const execSync = require("child_process").execSync;
const lastCommitCommand = "git rev-parse HEAD";
const COMMIT_SHA = execSync(lastCommitCommand).toString().trim();

const BUILD_ID = `${APP_VERSION}-${COMMIT_SHA}`;

console.log(`Building app version: ${VERSION_AND_SHA}`);

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
    BUILD_ID,
    AXISNOW_DECRYPT
  },
  generateBuildId: async () => BUILD_ID,
  webpack: (config, { _buildId, _dev, isServer, _defaultLoaders, webpack }) => {
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

    // upload sourcemaps to bugsnag if we are not in dev
    if (!dev && process.env.NEXT_PUBLIC_BUGSNAG_API_KEY) {
      const bugsnagConfig = {
        apiKey: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
        appVersion: BUILD_ID
      };
      config.plugins.push(new BugsnagBuildReporterPlugin(bugsnagConfig));
      config.plugins.push(
        new BugsnagSourceMapUploaderPlugin({
          ...bugsnagConfig,
          publicPath: isServer ? "" : "*/_next",
          overwrite: true
        })
      );
    }

    return config;
  }
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});
module.exports = withSourceMaps(withTM(withBundleAnalyzer(config)));
