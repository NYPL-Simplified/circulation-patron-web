import * as env from "utils/env";
/**
 * A util to set env vars.
 */
export default function setEnv({
  CONFIG_FILE = undefined,
  CIRCULATION_MANAGER_BASE = undefined,
  REGISTRY_BASE = undefined,
  NEXT_PUBLIC_AXIS_NOW_DECRYPT = undefined
}: {
  CONFIG_FILE?: string;
  CIRCULATION_MANAGER_BASE?: string;
  REGISTRY_BASE?: string;
  NEXT_PUBLIC_AXIS_NOW_DECRYPT?: boolean;
}) {
  (env.CONFIG_FILE as any) = CONFIG_FILE;
  (env.CIRCULATION_MANAGER_BASE as any) = CIRCULATION_MANAGER_BASE;
  (env.REGISTRY_BASE as any) = REGISTRY_BASE;
  (env.NEXT_PUBLIC_AXIS_NOW_DECRYPT as any) = NEXT_PUBLIC_AXIS_NOW_DECRYPT;
}
