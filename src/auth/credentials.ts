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

/**
 * We do not parse this into an object here
 * because we want it to stay a string so that
 * it passes === if it doesn't change.
 */
export function getCredentials(
  librarySlug: string | null
): AuthCredentials | undefined {
  const credentials = Cookie.get(cookieName(librarySlug));
  return credentials ? JSON.parse(credentials) : undefined;
}

export function setAuthCredentials(
  librarySlug: string | null,
  credentials: AuthCredentials
) {
  Cookie.set(cookieName(librarySlug), JSON.stringify(credentials));
}

export function clearCredentials(librarySlug: string | null) {
  Cookie.remove(cookieName(librarySlug));
}

export function generateToken(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}
