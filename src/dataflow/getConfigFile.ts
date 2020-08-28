import { AppSetupError } from "./../errors";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { AppConfigFile } from "interfaces";

/**
 * Reads a config file either from local path or
 * http request, parses it, and returns it as an object
 */
export default async function getConfigFile(
  configFileSetting: string
): Promise<AppConfigFile> {
  if (configFileSetting.startsWith("http")) {
    return await fetchConfigFile(configFileSetting);
  }
  const configFilePath = path.join(process.cwd(), configFileSetting);
  if (!existsSync(configFilePath)) {
    throw new AppSetupError("Config file not found at: " + configFilePath);
  }
  const text = readFileSync(configFilePath, "utf8");
  return parseConfigText(text);
}

/**
 * Fetches a config file from the network, parses it into
 * an object and returns it
 */
async function fetchConfigFile(configFileUrl: string): Promise<AppConfigFile> {
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
function parseConfigText(raw: string): AppConfigFile {
  return raw
    .split("\n")
    .map(v => v.trim())
    .filter(line => line !== "")
    .reduce((config, line) => {
      if (line.charAt(0) !== "#") {
        const [path, circManagerUrl] = line.split("|");
        return { ...config, [path]: circManagerUrl };
      }
      return config;
    }, {});
}
