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
  return await parseConfig(text);
}

/**
 * Fetches a config file from the network, parses it into
 * an object and returns it
 */
async function fetchConfigFile(configFileUrl) {
  try {
    const response = await fetch(configFileUrl);
    const text = await response.text();
    const parsed = await parseConfig(text);
    return parsed;
  } catch (e) {
    console.error(e);
    throw new Error("Could not fetch config file at: " + configFileUrl);
  }
}

/**
 * Fetches an object of libraries from a library registry
 */
async function fetchLibrariesFromRegistry(
  registryBase
) {
  const response = await fetch(registryBase);
  if (!response.ok) {
    throw new Error("Could not fetch registry base at: " + registryBase);
  }
  const registryFeed = (await response.json());
  if (!registryFeed.catalogs) {
    throw new Error(
      "Registry feed did not contain any catalogs at url: " + registryBase
    );
  }

  return registryFeed.catalogs.reduce((record, catalog) => {
    const authDocLink = catalog.links.find(
      link => link.type === "application/vnd.opds.authentication.v1.0+json"
    )
    if (!authDocLink) {
      throw new ApplicationError({
        title: "Invalid Registry Feed",
        detail: `Catalog ${catalog.metadata.title} is missing an auth document link at registry url: ${registryBase}`,
        status: 500
      });
    }
    const authDocUrl = authDocLink.href;
    const library = { title: catalog.metadata.title, authDocUrl };
    return {
      ...record,
      [catalog.metadata.id]: library
    };
  }, {});
}

/**
 * Creates a LibrariesConfig from the object in the config file
 */
function makeLibrariesConfig(
  libraries
) {
  return Object.keys(libraries).reduce((record, slug) => {
    const authDocUrl = libraries[slug];
    if (!authDocUrl)
      throw new AppSetupError(
        `CONFIG_FILE.libraries contained a key without an auth doc url: ${slug}`
      );

    return { ...record, [slug]: { title: slug, authDocUrl } };
  }, {});
}

/**
 * Parses a YAML string into JSON and then into the format expected by
 * the app.
 */
async function parseConfig(raw) {
  const unparsed = YAML.parse(raw);
  // specifically set defaults for a couple values.
  const companionApp =
    unparsed.companion_app === "openebooks" ? "openebooks" : "simplye";

  const showMedium = unparsed.show_medium !== false;

  // openebooks settings
  const openebooks = unparsed.openebooks;
  const defaultLibrary = openebooks ? openebooks.default_library : undefined;

  // get the libraries config from either a registry base or the object in the config file
  const libraries =
    typeof unparsed.libraries === "string"
      ? await fetchLibrariesFromRegistry(unparsed.libraries)
      : makeLibrariesConfig(unparsed.libraries);

  // otherwise assume the file is properly structured.
  return {
    instanceName: unparsed.instance_name || "Patron Web Catalog",
    libraries,
    mediaSupport: unparsed.media_support || {},
    bugsnagApiKey: unparsed.bugsnag_api_key || null,
    gtmId: unparsed.gtmId || null,
    companionApp,
    showMedium,
    openebooks: openebooks ? { defaultLibrary } : null
  };
}

const configFileSetting = process.env.CONFIG_FILE;
if (typeof configFileSetting !== "string")
  throw new AppSetupError("process.env.CONFIG_FILE must be set.");

// get the config and print it to stdout so next.config.js can use it
getAppConfig(configFileSetting).then(val => {
  console.log(JSON.stringify(val));
});

module.exports = getAppConfig;
