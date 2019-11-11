import * as express from 'express';

/**
 * set up the app to use webpack dev middleware and 
 * compile app in memory
 */

function wdm (app: express.Application) {
  console.log("Using webpack dev middleware")
  const webpackConfig  = require('../../webpack.dev.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpack = require('webpack');

  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, {
    hot: false,
    // this is the url where static files will be available
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: true,
  }));
  // enable hot reloading next, probably going to have to switch webpack 
  // to use babel for ts compilation
  app.use(webpackHotMiddleware(compiler));

  
}

export default wdm;