const path = require("path");
const fs = require("fs");
const YAML = require("yaml");

/**
 * Reads a config file either from local path or
 * http request, parses it, and returns it as an object
 */
function getAppConfig(configFileSetting) {
  if (configFileSetting.startsWith("http")) {
    fetchConfigFile(configFileSetting).then(config => {
      return config;
    });
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
    const parsed = parseConfigText(text);
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
  // otherwise assume the file is properly structured.
  return {
    libraries: unparsed.libraries,
    mediaSupport: unparsed.media_support ?? {},
    bugsnagApiKey: unparsed.bugsnagApiKey ?? null,
    gtmId: unparsed.gtmId ?? null,
    companionApp,
    showMedium
  };
}

module.exports = getAppConfig;