import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import {
  BUILD_ID,
  BUGSNAG_API_KEY,
  IS_DEVELOPMENT,
  IS_SERVER
} from "utils/env";

if (BUGSNAG_API_KEY) {
  Bugsnag.start({
    apiKey: BUGSNAG_API_KEY,
    appVersion: BUILD_ID,
    plugins: [new BugsnagPluginReact()],
    appType: IS_SERVER ? "web-server" : "client",
    releaseStage: IS_DEVELOPMENT ? "developmet" : "production"
  });
}

export const BugsnagErrorBoundary = BUGSNAG_API_KEY
  ? Bugsnag.getPlugin("react")?.createErrorBoundary(React)
  : undefined;

export default Bugsnag;
