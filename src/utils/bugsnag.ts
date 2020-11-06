import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import {
  BUILD_ID,
  BUGSNAG_API_KEY,
  IS_SERVER,
  CONFIG_FILE,
  GIT_BRANCH,
  GIT_COMMIT_SHA
} from "utils/env";
import { APP_CONFIG } from "config";

if (BUGSNAG_API_KEY) {
  Bugsnag.start({
    apiKey: BUGSNAG_API_KEY,
    appVersion: BUILD_ID,
    plugins: [new BugsnagPluginReact()],
    appType: IS_SERVER ? "web-server" : "client",
    // the release stage is based on the github branch it is deployed from.
    releaseStage:
      GIT_BRANCH === "production"
        ? "production"
        : GIT_BRANCH === "qa"
        ? "qa"
        : "development",
    metadata: {
      App: {
        "Instance Name": APP_CONFIG.instanceName,
        "Git Branch": GIT_BRANCH,
        "Git Commit SHA": GIT_COMMIT_SHA
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
