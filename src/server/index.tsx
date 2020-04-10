import express from "express";
import webpackDevMiddleware from "./wdm";
import ssr from "./ssr";
import loadCache from "./loadCache";
import isDevelopment from "./isDevelopment";

const initialize = async () => {
  const app = express();
  const port = process.env.PORT || 3000;

  /**
   * Get library cache and associated properties
   */
  const data = await loadCache();
  const { distDir } = data;

  /**
   * If we are in development, use webpack dev middleware,
   * otherwise we serve the js and css files with express.static
   */
  if (isDevelopment) {
    console.log("Running in development mode");
    /**
     * This will build the app files with webpack and the next
     * middleware wont be invoked until it's finished.
     */
    webpackDevMiddleware(app);
  } else {
    console.log("Running in production mode");
    /**
     * Tell express where to get files and how to handle all requests
     * This is fired every time the server side receives a request
     */
    const absoluteDistDir = distDir;
    console.log(
      "Statically serving files from " +
        absoluteDistDir +
        " via the url /static"
    );
    app.use("/static", express.static(absoluteDistDir));
  }
  // Any request not handled previously will get served html via ssr.
  app.use(ssr(data));

  app.listen(port, function() {
    console.log("Server listening on port " + port);
  });
};
initialize();
