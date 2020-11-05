import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import { APP_VERSION, BUGSNAG_API_KEY } from "utils/env";

if (BUGSNAG_API_KEY) {
  Bugsnag.start({
    apiKey: BUGSNAG_API_KEY,
    appVersion: APP_VERSION,
    plugins: [new BugsnagPluginReact()]
  });
}

export const BugsnagErrorBoundary = BUGSNAG_API_KEY
  ? Bugsnag.getPlugin("react")?.createErrorBoundary(React)
  : undefined;

export default Bugsnag;
