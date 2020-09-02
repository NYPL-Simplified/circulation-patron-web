import * as React from "react";
import Cookie from "js-cookie";
import { AuthCredentials } from "interfaces";

/**
 * If you pass a librarySlug, the cookie will be scoped to the
 * library you are viewing. This is useful in a multi library setup
 */
function cookieName(librarySlug: string | null): string {
  const AUTH_COOKIE_NAME = "CPW_AUTH_COOKIE";
  return `${AUTH_COOKIE_NAME}/${librarySlug}`;
}

export function useAuthCredentials(
  librarySlug: string | null
): AuthCredentials | undefined {
  const credentials = Cookie.get(cookieName(librarySlug));
  // we want this to stay the same reference unless the cookie value changes
  return React.useMemo(
    () => (credentials ? JSON.parse(credentials) : undefined),
    [credentials]
  );
}

export function setAuthCredentials(
  librarySlug: string | null,
  credentials: AuthCredentials
) {
  Cookie.set(cookieName(librarySlug), JSON.stringify(credentials));
}
