import * as React from "react";
import useTypedSelector from "./useTypedSelector";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { useRouter, NextRouter } from "next/router";
import useLinkUtils from "components/context/LinkUtilsContext";
import CleverAuthPlugin from "../auth/cleverAuthPlugin";

const SAML_AUTH_TYPE = "http://librarysimplified.org/authtype/SAML-2.0";

const CREDENTIALS_NOT_FOUND = "CREDENTIALS_NOT_FOUND";
const PROVIDER_NOT_FOUND = "PROVIDER_NOT_FOUND";

export interface AuthCredentials {
  credentials: string;
  provider: string;
}

export function getCredentials(router: NextRouter): AuthCredentials {
  const cleverAccessToken =
    typeof window !== "undefined" && CleverAuthPlugin.lookForCredentials();

  const { access_token: samlAccessToken } = router.query;

  /* TODO: throw error if samlAccessToken and cleverAccessToken exist at the same time as this is an invalid state that shouldn't be reached */

  if (samlAccessToken) {
    return {
      credentials: `Bearer ${samlAccessToken}`,
      provider: SAML_AUTH_TYPE
    };
  } else if (cleverAccessToken && cleverAccessToken.credentials?.credentials) {
    const { credentials, provider } = cleverAccessToken.credentials;
    return {
      credentials: credentials,
      provider: provider
    };
  }

  return {
    credentials: CREDENTIALS_NOT_FOUND,
    provider: PROVIDER_NOT_FOUND
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

  const clearWebpubViewerStorage = () => {
    const WebpubViewerStorage = window?.indexedDB?.open("WebpubViewerDb");
    if (WebpubViewerStorage) {
      window.indexedDB.deleteDatabase("WebpubViewerDb");
    }
  };
  const signOut = () => {
    dispatch(actions.clearAuthCredentials());
    clearWebpubViewerStorage();
  };
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

  const { credentials, provider } = getCredentials(router);

  const hasValidCredentials =
    provider !== PROVIDER_NOT_FOUND && credentials !== CREDENTIALS_NOT_FOUND;

  React.useEffect(() => {
    if (hasValidCredentials) {
      dispatch(
        actions.saveAuthCredentials({
          provider: provider,
          credentials: credentials
        })
      );
    }
    /* clear #access_token from URL after credentials are set */
    window.location.hash = "";
  }, [hasValidCredentials, credentials, provider, actions, dispatch]);

  return {
    isSignedIn,
    signIn,
    signOut,
    signOutAndGoHome,
    ...authState
  };
}

export default useAuth;
