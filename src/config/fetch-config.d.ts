import { AppConfig } from "interfaces";

declare function getAppConfig(configFileSetting: string): Promise<AppConfig>;
export default getAppConfig;
