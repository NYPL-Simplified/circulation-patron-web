const path = require("path");
const fs = require("fs");
const YAML = require("yaml");
const fetch = require("node-fetch");

/**
 * This file will print the config file to stdout and then exit, so
 * it can be synchronously executed in next.config.js when starting the
 * application.
 */

/**
 * Reads a config file either from local path or
 * http request, parses it, and returns it as an object
 */
async function getAppConfig(configFileSetting) {
  if (configFileSetting.startsWith("http")) {
    return await fetchConfigFile(configFileSetting);
  }
  const configFilePath = path.join(process.cwd(), configFileSetting);
  if (!fs.existsSync(configFilePath)) {
    throw new Error("Config file not found at: " + configFilePath);
  }
  const text = fs.readFileSync(configFilePath, "utf8");
  return parseConfig(text);
}

/**
 * Fetches a config file from the network, parses it into
 * an object and returns it
 */
async function fetchConfigFile(configFileUrl) {
  try {
    const response = await fetch(configFileUrl);
    const text = await response.text();
    const parsed = parseConfig(text);
    return parsed;
  } catch (e) {
    console.error(e);
    throw new Error("Could not fetch config file at: " + configFileUrl);
  }
}

/**
 * Parses a YAML string into JSON and then into the format expected by
 * the app.
 */
function parseConfig(raw) {
  const unparsed = YAML.parse(raw);
  // specifically set defaults for a couple values.
  const companionApp =
    unparsed.companion_app === "openebooks" ? "openebooks" : "simplye";

  const showMedium = unparsed.show_medium !== false;

  // openebooks settings
  const openebooks = unparsed.openebooks;
  const defaultLibrary = openebooks ? openebooks.default_library : undefined;

  // otherwise assume the file is properly structured.
  return {
    instanceName: unparsed.instance_name || "Patron Web Catalog",
    libraries: unparsed.libraries,
    mediaSupport: unparsed.media_support || {},
    bugsnagApiKey: unparsed.bugsnag_api_key || null,
    gtmId: unparsed.gtmId || null,
    companionApp,
    showMedium,
    openebooks: openebooks ? { defaultLibrary } : null
  };
}

// get the config and print it to stdout so next.config.js can use it
getAppConfig(process.env.CONFIG_FILE).then(val => {
  console.log(JSON.stringify(val));
});

module.exports = getAppConfig;
