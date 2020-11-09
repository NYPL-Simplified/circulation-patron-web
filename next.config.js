const withTM = require("next-transpile-modules")([
  "library-simplified-webpub-viewer"
]);
const {
  BugsnagBuildReporterPlugin,
  BugsnagSourceMapUploaderPlugin
} = require("webpack-bugsnag-plugins");
const withSourceMaps = require("@zeit/next-source-maps");
const package = require("./package.json");
const APP_VERSION = package.version;

// get the latest Git commit sha
const execSync = require("child_process").execSync;
const GIT_COMMIT_SHA = execSync("git rev-parse HEAD").toString().trim();
const GIT_BRANCH = execSync("git branch --show-current").toString().trim();

// fetch the config file
const APP_CONFIG = execSync("node src/config/fetch-config.js", {
  encoding: "utf-8"
});

const BUILD_ID = `${APP_VERSION}-${GIT_BRANCH}.${GIT_COMMIT_SHA}`;

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
    GIT_BRANCH,
    GIT_COMMIT_SHA,
    AXISNOW_DECRYPT
  },
  generateBuildId: async () => BUILD_ID,
  webpack: (config, { buildId, dev, isServer, _defaultLoaders, webpack }) => {
    console.log(
      `Building ${isServer ? "server" : "client"} files for version: ${buildId}`
    );
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

    // pass the APP_CONFIG as a global
    config.plugins.push(
      new webpack.DefinePlugin({
        APP_CONFIG
      })
    );

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
    if (!dev && APP_CONFIG.bugsnagApiKey) {
      const bugsnagConfig = {
        apiKey: APP_CONFIG.bugsnagApiKey,
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
