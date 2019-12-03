import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import OAuthButton from "./components/OAuthButton";

const OAuthPlugin: AuthPlugin = {
  type: "http://librarysimplified.org/authtype/OAuth-with-intermediary",

  lookForCredentials: () => {
    // Check for auth token in URL after redirect
    const isServer = typeof window === "undefined";
    if (!isServer) {
      const accessTokenKey = "access_token=";
      const errorKey = "error=";
      if (window && window.location && window.location.hash) {
        if (window.location.hash.indexOf(accessTokenKey) !== -1) {
          const hash = window.location.hash;
          const accessTokenStart = hash.indexOf(accessTokenKey);
          const accessToken = hash
            .slice(accessTokenStart + accessTokenKey.length)
            .split("&")[0];
          const credentials = {
            provider: "OAuth",
            credentials: "Bearer " + accessToken
          };
          window.location.hash = "";
          return { credentials };
        } else if (window.location.hash.indexOf(errorKey) !== -1) {
          const hash = window.location.hash;
          const errorStart = hash.indexOf(errorKey);
          const error = hash.slice(errorStart + errorKey.length).split("&")[0];
          const problemDetail = JSON.parse(
            decodeURIComponent(error.replace(/\+/g, "%20"))
          );
          window.location.hash = "";
          return { error: problemDetail.title };
        }
      }
    }
  },

  formComponent: null,
  buttonComponent: OAuthButton
};

export default OAuthPlugin;
