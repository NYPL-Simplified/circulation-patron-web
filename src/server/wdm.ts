import * as express from "express";

/**
 * set up the app to use webpack dev middleware and
 * compile app in memory
 */

function wdm(app: express.Application) {
  console.log("Using webpack dev middleware");
  const webpackConfig = require("../../webpack.dev.js");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");
  const webpack = require("webpack");

  const compiler = webpack(webpackConfig);

  app.use(
    webpackDevMiddleware(compiler, {
      hot: true,
      // this is the url where static files will be available
      publicPath: webpackConfig.output.publicPath,
      serverSideRender: true
    })
  );

  app.use(webpackHotMiddleware(compiler));
}

export default wdm;
