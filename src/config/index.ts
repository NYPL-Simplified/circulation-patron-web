import { AppConfig } from "interfaces.js";
import * as unparsed from "./load-config.js";

function parseConfig(unparsed: any): AppConfig {
  // specifically set defaults for a couple values.
  const companionApp =
    unparsed.companion_app === "openebooks" ? "openebooks" : "simplye";

  const showMedium = unparsed.show_medium !== false;
  // otherwise assume the file is properly structured.
  return {
    instanceName: unparsed.instanceName ?? "Patron Web Catalog",
    libraries: unparsed.libraries,
    mediaSupport: unparsed.media_support ?? {},
    gtmId: unparsed.gtmId ?? null,
    bugsnagApiKey: unparsed.bugsnagApiKey ?? null,
    companionApp,
    showMedium
  };
}

export const APP_CONFIG = parseConfig(unparsed);
