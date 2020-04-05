module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    !isServer && config.plugins.push(new webpack.IgnorePlugin(/jsdom$/));
    return config;
  },
  env: {
    SIMPLIFIED_CATALOG_BASE: "http://simplye-dev-cm.amigos.org/xyzlib",
  },
};
