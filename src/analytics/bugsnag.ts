import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import {
  BUILD_ID,
  BUGSNAG_API_KEY,
  IS_SERVER,
  CONFIG_FILE,
  GIT_BRANCH,
  GIT_COMMIT_SHA,
  NODE_ENV
} from "utils/env";

if (BUGSNAG_API_KEY) {
  Bugsnag.start({
    apiKey: BUGSNAG_API_KEY,
    appVersion: BUILD_ID,
    plugins: [new BugsnagPluginReact()],
    appType: IS_SERVER ? "node" : "browser",
    // the release stage is based on the github branch it is deployed from.
    releaseStage:
      NODE_ENV === "production" && GIT_BRANCH === "production"
        ? "production"
        : NODE_ENV === "production" && GIT_BRANCH === "qa"
        ? "qa"
        : "development",
    metadata: {
      App: {
        "Node Env": NODE_ENV,
        "Git Branch": GIT_BRANCH,
        "Git Commit SHA": GIT_COMMIT_SHA,
        "Instance Name": APP_CONFIG.instanceName
      },
      "App Config": {
        "Config File": APP_CONFIG,
        "Config File Source": CONFIG_FILE
      }
    }
  });
}

export const BugsnagErrorBoundary = BUGSNAG_API_KEY
  ? Bugsnag.getPlugin("react")?.createErrorBoundary(React)
  : undefined;

export default Bugsnag;
