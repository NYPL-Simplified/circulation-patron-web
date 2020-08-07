import * as React from "react";
import useTypedSelector from "./useTypedSelector";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { useRouter } from "next/router";
import useLinkUtils from "components/context/LinkUtilsContext";
import { CleverAuthPlugin } from "../auth/cleverAuthPlugin";

const SAML_AUTH_TYPE = "http://librarysimplified.org/authtype/SAML-2.0";

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
  const { access_token: samlAccessToken } = router.query;

  const cleverAccessToken =
    typeof window !== "undefined" && CleverAuthPlugin.lookForCredentials();

  const accessToken = samlAccessToken || cleverAccessToken;

  const { credentials: cleverCredentials } = cleverAccessToken || {
    credentials: { credentials: "", provider: "" }
  };

  React.useEffect(() => {
    if (accessToken) {
      const credentials = `Bearer: ${cleverAccessToken || samlAccessToken}`;
      dispatch(
        actions.saveAuthCredentials({
          provider: cleverCredentials
            ? cleverCredentials.provider
            : SAML_AUTH_TYPE,
          credentials: cleverCredentials
            ? cleverCredentials.credentials
            : credentials
        })
      );
    }

    window.location.hash = "";
  }, [
    accessToken,
    samlAccessToken,
    dispatch,
    actions,
    cleverAccessToken,
    cleverCredentials
  ]);

  return {
    isSignedIn,
    signIn,
    signOut,
    signOutAndGoHome,
    ...authState
  };
}

export default useAuth;
