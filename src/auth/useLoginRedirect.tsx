import extractParam from "dataflow/utils";
import useLinkUtils from "hooks/useLinkUtils";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";
import { IS_SERVER } from "utils/env";

/**
 * Extracts the redirect url stored in the browser url bar and returns
 * a version including the origin (fullSuccessUrl) or a version that is
 * just a path (successPath).
 */
export default function useLoginRedirectUrl() {
  const { buildMultiLibraryLink } = useLinkUtils();
  const { query } = useRouter();

  const catalogRootPath = buildMultiLibraryLink("/");
  const nextPath = extractParam(query, LOGIN_REDIRECT_QUERY_PARAM);

  // if the redirect url is the login url, we would end up in a loop.
  const isLoginPath = nextPath?.includes("/login");

  // if the redirect url is the home page, choose the catalog root instead
  const isHomePage = nextPath === "/";

  // go to catalog root if nextPath is invalid
  const successPath =
    !nextPath || isLoginPath || isHomePage ? catalogRootPath : nextPath;

  const fullSuccessUrl = IS_SERVER
    ? ""
    : `${window.location.origin}${successPath}`;

  return {
    fullSuccessUrl,
    successPath
  };
}
