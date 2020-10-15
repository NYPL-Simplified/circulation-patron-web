import { AppConfig } from "interfaces";

declare async function getAppConfig(configFileSetting: string): AppConfig;

export default getAppConfig;
