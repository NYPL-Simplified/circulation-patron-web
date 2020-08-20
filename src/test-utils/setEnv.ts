import * as env from "utils/env";
/**
 * A util to set env vars.
 */
export default function setEnv({
  CONFIG_FILE = undefined,
  CIRCULATION_MANAGER_BASE = undefined,
  REGISTRY_BASE = undefined
}: {
  CONFIG_FILE?: string;
  CIRCULATION_MANAGER_BASE?: string;
  REGISTRY_BASE?: string;
}) {
  (env.CONFIG_FILE as any) = CONFIG_FILE;
  (env.CIRCULATION_MANAGER_BASE as any) = CIRCULATION_MANAGER_BASE;
  (env.REGISTRY_BASE as any) = REGISTRY_BASE;
}
