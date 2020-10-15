import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import { APP_VERSION } from "utils/env";
import { APP_CONFIG } from "config";

if (APP_CONFIG.bugsnagApiKey) {
  Bugsnag.start({
    apiKey: APP_CONFIG.bugsnagApiKey,
    appVersion: APP_VERSION,
    plugins: [new BugsnagPluginReact()]
  });
}

export const BugsnagErrorBoundary = APP_CONFIG.bugsnagApiKey
  ? Bugsnag.getPlugin("react")?.createErrorBoundary(React)
  : undefined;

export default Bugsnag;
