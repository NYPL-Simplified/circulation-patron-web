import * as React from "react";
import useTypedSelector from "./useTypedSelector";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { useRouter } from "next/router";
import useLinkUtils from "components/context/LinkUtilsContext";
import { CleverAuthPlugin } from "../auth/cleverAuthPlugin";

const SAML_AUTH_TYPE = "http://librarysimplified.org/authtype/SAML-2.0";

const TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND";

export function getAccessToken(
  router
): {
  token: {
    credentials: {
      credentials?: string | undefined;
      provider?: string | undefined;
      error?: string | undefined;
    };
  };

  type: string;
} {
  const cleverAccessToken =
    typeof window !== "undefined" && CleverAuthPlugin.lookForCredentials();

  const { access_token: samlAccessToken } = router.query;

  let type = TOKEN_NOT_FOUND;
  //to-do: import AuthCredentials type to avoid manually typing this
  let token = { credentials: {} } as {
    credentials?:
      | {
          credentials?: string | undefined;
          error?: string | undefined;
        }
      | undefined;
    error?: string | undefined;
  };
  /* there should never be a case where both types of access tokens exists at the same time */
  if (samlAccessToken) {
    (type = SAML_AUTH_TYPE),
      (token = {
        credentials: {
          credentials: `Bearer ${samlAccessToken}`
        }
      });
  } else if (cleverAccessToken) {
    type = "Clever";
    token = cleverAccessToken;
  }

  return {
    /*Object literal may only specify known properties, and 'token' does not exist in type '(token: { credentials: { credentials?: string | undefined; error?: string | undefined; }; }, type: string) */
    // @ts-ignore
    token: token,
    type: type
  };
}

/**
 * Will get auth data from cookies and make sure it's saved to redux
 * and will also provide auth data from the redux store, as well as
 * the calculated isSignedIn value
 */
function useAuth() {
  const router = useRouter();
  const authState = useTypedSelector(state => state.auth);

  const isSignedIn = !!authState?.credentials;
  const { actions, dispatch } = useActions();
  const { buildMultiLibraryLink } = useLinkUtils();
  const signOut = () => dispatch(actions.clearAuthCredentials());
  const signOutAndGoHome = () => {
    signOut();
    const link = buildMultiLibraryLink({ href: "/" });
    router.push(link.href, link.as);
  };

  const loansUrl = useTypedSelector(state => {
    return state.loans.url;
  });

  const auth = useTypedSelector(state => state.auth);

  const noop = () => ({});

  const { title, callback, cancel, providers } = auth;

  const signIn = () =>
    loansUrl &&
    providers &&
    dispatch(
      actions.showAuthForm(
        callback || noop,
        cancel || noop,
        providers,
        title || ""
      )
    ) &&
    dispatch(actions.fetchLoans(loansUrl));

  /*
   * We need to set SAML credentials whenenever they are available in a
   * query param
   */

  const accessToken = getAccessToken(router);

  React.useEffect(() => {
    const { type } = accessToken;
    const { credentials = "", provider = "" } = accessToken?.token
      ?.credentials || {
      credentials: ""
    };

    const isCleverAuth = type === "Clever";

    if (accessToken && accessToken.type !== TOKEN_NOT_FOUND) {
      dispatch(
        actions.saveAuthCredentials({
          provider: isCleverAuth ? provider : SAML_AUTH_TYPE,
          credentials: credentials
        })
      );
    }
    /* clear #access_token from URL after credentials are set */
    window.location.hash = "";
  }, [accessToken, actions, dispatch]);

  return {
    isSignedIn,
    signIn,
    signOut,
    signOutAndGoHome,
    ...authState
  };
}

export default useAuth;
