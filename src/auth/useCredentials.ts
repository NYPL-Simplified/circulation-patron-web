import * as React from "react";
import Cookie from "js-cookie";
import { AuthCredentials, OPDS1 } from "interfaces";
import { IS_SERVER } from "utils/env";
import { NextRouter, useRouter } from "next/router";
import { SAML_LOGIN_QUERY_PARAM } from "utils/constants";

/**
 * This hook:
 *  - Searches for credentials in cookies
 *  - Syncs those cookies with an internal react state so that
 *    changes to the credentials causes a re-render. Just
 *    changing the cookie wouldn't do this.
 *  - Searches for credentials embedded in the browser url. If
 *    if finds a token, it extracts it and sets it as the current
 *    credentials.
 */
export default function useCredentials(slug: string | null) {
  const router = useRouter();
  const [credentialsState, setCredentialsState] = React.useState<
    AuthCredentials | undefined
  >(getCredentialsCookie(slug));
  // sync up cookie state with react state
  React.useEffect(() => {
    const cookie = getCredentialsCookie(slug);
    if (cookie) setCredentialsState(cookie);
  }, [slug]);

  // set both cookie and state credentials
  const setCredentials = React.useCallback(
    (creds: AuthCredentials) => {
      setCredentialsState(creds);
      setCredentialsCookie(slug, creds);
    },
    [slug]
  );

  // clear both cookie and state credentials
  const clear = React.useCallback(() => {
    setCredentialsState(undefined);
    clearCredentialsCookie(slug);
  }, [slug]);

  // use credentials from browser url if they exist
  const { token: urlToken, methodType: urlMethodType } =
    getUrlCredentials(router) ?? {};

  React.useEffect(() => {
    if (urlToken && urlMethodType) {
      setCredentials({ token: urlToken, methodType: urlMethodType });
    }
  }, [urlToken, urlMethodType, setCredentials]);

  return {
    credentials: credentialsState,
    setCredentials,
    clearCredentials: clear
  };
}

/**
 * COOKIE CREDENDIALS
 */
/**
 * If you pass a librarySlug, the cookie will be scoped to the
 * library you are viewing. This is useful in a multi library setup
 */
function cookieName(librarySlug: string | null): string {
  const AUTH_COOKIE_NAME = "CPW_AUTH_COOKIE";
  return `${AUTH_COOKIE_NAME}/${librarySlug}`;
}

function getCredentialsCookie(
  librarySlug: string | null
): AuthCredentials | undefined {
  const credentials = Cookie.get(cookieName(librarySlug));
  return credentials ? JSON.parse(credentials) : undefined;
}

function setCredentialsCookie(
  librarySlug: string | null,
  credentials: AuthCredentials
) {
  Cookie.set(cookieName(librarySlug), JSON.stringify(credentials));
}

function clearCredentialsCookie(librarySlug: string | null) {
  Cookie.remove(cookieName(librarySlug));
}

export function generateToken(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}

/**
 * URL CREDENTIALS
 */
function getUrlCredentials(router: NextRouter) {
  /* TODO: throw error if samlAccessToken and cleverAccessToken exist at the same time as this is an invalid state that shouldn't be reached */
  return IS_SERVER
    ? undefined
    : lookForCleverCredentials() ?? lookForSamlCredentials(router);
}

// check for clever credentials
function lookForCleverCredentials(): AuthCredentials | undefined {
  if (!IS_SERVER) {
    const accessTokenKey = "access_token=";
    if (window?.location?.hash) {
      if (window.location.hash.indexOf(accessTokenKey) !== -1) {
        const hash = window.location.hash;
        const accessTokenStart = hash.indexOf(accessTokenKey);
        const accessToken = hash
          .slice(accessTokenStart + accessTokenKey.length)
          .split("&")[0];
        const token = `Bearer ${accessToken}`;

        // clear the url hash with replaceState
        const url = new URL(window.location.href);
        url.hash = "";
        window.history.replaceState(null, document.title, url.toString());

        return { token, methodType: OPDS1.CleverAuthType };
      }
    }
  }
}

// check for saml credentials
function lookForSamlCredentials(
  router: NextRouter
): AuthCredentials | undefined {
  const { [SAML_LOGIN_QUERY_PARAM]: samlAccessToken } = router.query;
  if (samlAccessToken) {
    if (!IS_SERVER && typeof window !== "undefined") {
      // clear the browser query using replaceState
      const url = new URL(window.location.href);
      if (url.searchParams.has(SAML_LOGIN_QUERY_PARAM)) {
        url.searchParams.delete(SAML_LOGIN_QUERY_PARAM);
        window.history.replaceState(null, document.title, url.toString());
      }
    }

    return {
      token: `Bearer ${samlAccessToken}`,
      methodType: OPDS1.SamlAuthType
    };
  }
}
