const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

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
  return parseConfigText(text);
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
    throw new Error("Could not fetch config file at: " + configFileUrl);
  }
}

/**
 * Parses the raw text of a config file into an object.
 */
function parseConfigText(raw) {
  return YAML.parse(raw);
}

module.exports = getAppConfig;
