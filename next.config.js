const config = {
  env: {
    SIMPLIFIED_CATALOG_BASE: process.env.SIMPLIFIED_CATALOG_BASE,
    SHORTEN_URLS: process.env.SHORTEN_URLS,
    CONFIG_FILE: process.env.CONFIG_FILE,
    REACT_AXE: process.env.REACT_AXE,
    CACHE_EXPIRATION_SECONDS: process.env.CACHE_EXPIRATION_SECONDS
  },
  webpack: (config, { _buildId, _dev, isServer, _defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    !isServer && config.plugins.push(new webpack.IgnorePlugin(/jsdom$/));
    // Fixes dependency on "fs" module.
    // we don't (and can't) depend on this in client-side code.
    if (!isServer) {
      config.node = {
        fs: "empty"
      };
    }

    return config;
  }
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});
module.exports = withBundleAnalyzer(config);
