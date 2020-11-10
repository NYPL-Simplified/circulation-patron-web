import { AppConfig } from "interfaces";
import { fixtures } from "test-utils";
import * as env from "utils/env";

export default function mockConfig(custom?: Partial<AppConfig>) {
  const config = {
    ...fixtures.config,
    ...custom
  };
  (env.APP_CONFIG as any) = config;
  (process.env.APP_CONFIG as any) = JSON.stringify(config);
}
