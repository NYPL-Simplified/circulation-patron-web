import * as React from "react";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";
import { UrlObject } from "url";
import { IS_SERVER } from "utils/env";
import useLibraryContext from "components/context/LibraryContext";

export default function useLogin() {
  const { query, push, asPath } = useRouter();
  const { slug } = useLibraryContext();

  const getLoginUrl = React.useCallback(
    (methodId?: string): UrlObject => {
      const pathname = methodId
        ? "/[library]/login/[methodId]"
        : "/[library]/login";

      // preserves existing query parameters
      const newQuery = methodId ? { ...query, methodId } : query;
      // make sure that library is set (it is not already set on home page).
      newQuery.library = slug;

      // if no redirect is set, redirect to the current page
      if (!newQuery[LOGIN_REDIRECT_QUERY_PARAM]) {
        // do not set the redirect if the asPath is a full url (instead of a path),
        // as this will cause an invalid redirect url. This can happen when the page
        // was pre-rendered on the server and has not finished hydrating on the client side
        // see https://github.com/vercel/next.js/issues/8259
        if (!asPath.includes("http")) {
          newQuery[LOGIN_REDIRECT_QUERY_PARAM] = asPath;
        }
      }

      return {
        pathname,
        query: newQuery
      };
    },
    [query, asPath, slug]
  );

  const initLogin = React.useCallback(
    (methodId?: string) => {
      const urlObject = getLoginUrl(methodId);
      if (!IS_SERVER) push(urlObject, undefined, { shallow: true });
    },
    [push, getLoginUrl]
  );

  // the login url without any method selected
  const baseLoginUrl = getLoginUrl();

  return {
    getLoginUrl,
    initLogin,
    baseLoginUrl
  };
}
