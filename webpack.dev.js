const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");

var config = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    // hot module replacement
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    alias: {
      "react-dom": "@hot-loader/react-dom"
    }
  }
});
// different entrypoint to config hot reloading
config.entry.CirculationPatronWeb = [
  "react-hot-loader/patch",
  "./src/index.tsx",
  "webpack-hot-middleware/client",
  "webpack/hot/dev-server"
];
module.exports = config;
