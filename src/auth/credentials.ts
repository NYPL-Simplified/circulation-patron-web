import * as React from "react";
import Cookie from "js-cookie";
import { AuthCredentials } from "interfaces";
import { IS_SERVER } from "utils/env";

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

type UrlCredentialsResult =
  | { token: string }
  | { error: string | undefined }
  | undefined;
/**
 * Checks for credentials or auth errors embedded
 * in the browser url
 */
export function checkForCredentialsInUrl(): UrlCredentialsResult {
  const clever = lookForCleverCredentials();
  if (clever) return clever;
}

/**
 * Check for clever auth access token in the browser url
 */
function lookForCleverCredentials(): UrlCredentialsResult {
  if (!IS_SERVER) {
    const accessTokenKey = "access_token=";
    const errorKey = "error=";
    if (window?.location?.hash) {
      if (window.location.hash.indexOf(accessTokenKey) !== -1) {
        const hash = window.location.hash;
        const accessTokenStart = hash.indexOf(accessTokenKey);
        const accessToken = hash
          .slice(accessTokenStart + accessTokenKey.length)
          .split("&")[0];
        const token = `Bearer ${accessToken}`;
        return { token };
      } else if (window.location.hash.indexOf(errorKey) !== -1) {
        const hash = window.location.hash;
        const errorStart = hash.indexOf(errorKey);
        const error = hash.slice(errorStart + errorKey.length).split("&")[0];
        const problemDetail = JSON.parse(
          decodeURIComponent(error.replace(/\+/g, "%20"))
        );
        window.location.hash = "";
        return { error: problemDetail?.title as string | undefined };
      }
    }
  }
}
