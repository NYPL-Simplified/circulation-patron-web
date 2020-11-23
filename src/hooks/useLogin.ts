import * as React from "react";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";
import { UrlObject } from "url";

export default function useLogin() {
  const { query, push, asPath } = useRouter();

  const getLoginUrl = React.useCallback(
    (methodId?: string): UrlObject => {
      const pathname = methodId
        ? "/[library]/login/[methodId]"
        : "/[library]/login";

      // preserves existing query parameters
      const newQuery = methodId ? { ...query, methodId } : query;
      // if no redirect is set, redirect to the current page
      if (!newQuery[LOGIN_REDIRECT_QUERY_PARAM]) {
        newQuery[LOGIN_REDIRECT_QUERY_PARAM] = asPath;
      }

      return {
        pathname,
        query: newQuery
      };
    },
    [query, asPath]
  );

  const initLogin = React.useCallback(
    (methodId?: string) => {
      const urlObject = getLoginUrl(methodId);
      push(urlObject, undefined, { shallow: true });
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
