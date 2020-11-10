import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import {
  BUILD_ID,
  IS_SERVER,
  CONFIG_FILE,
  GIT_BRANCH,
  GIT_COMMIT_SHA,
  NODE_ENV,
  RELEASE_STAGE,
  APP_CONFIG
} from "utils/env";

if (APP_CONFIG.bugsnagApiKey) {
  Bugsnag.start({
    apiKey: APP_CONFIG.bugsnagApiKey,
    appVersion: BUILD_ID,
    plugins: [new BugsnagPluginReact()],
    appType: IS_SERVER ? "node" : "browser",
    // the release stage is based on the github branch it is deployed from.
    releaseStage: RELEASE_STAGE,
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

export const BugsnagErrorBoundary = APP_CONFIG.bugsnagApiKey
  ? Bugsnag.getPlugin("react")?.createErrorBoundary(React)
  : undefined;

export default Bugsnag;
