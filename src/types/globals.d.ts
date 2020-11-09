import { AppConfig } from "interfaces";

declare global {
  interface Window {
    dataLayer: Array<any> | undefined;
  }
  const APP_CONFIG: AppConfig;
}
