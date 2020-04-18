const merge = require("webpack-merge");
const common = require("./webpack.common.js");

var config = merge(common, {
  mode: "production"
});

module.exports = config;
