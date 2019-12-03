import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import OAuthButton from "./components/OAuthButton";

const OAuthPlugin: AuthPlugin = {
  type: "http://librarysimplified.org/authtype/OAuth-with-intermediary",

  lookForCredentials: () => {
    // Check for auth token in URL after redirect
    let isServer = typeof window === "undefined";
    if (!isServer) {
      let accessTokenKey = "access_token=";
      let errorKey = "error=";
      if (window && window.location && window.location.hash) {
        if (window.location.hash.indexOf(accessTokenKey) !== -1) {
          let hash = window.location.hash;
          let accessTokenStart = hash.indexOf(accessTokenKey);
          let accessToken = hash
            .slice(accessTokenStart + accessTokenKey.length)
            .split("&")[0];
          let credentials = {
            provider: "OAuth",
            credentials: "Bearer " + accessToken
          };
          window.location.hash = "";
          return { credentials };
        } else if (window.location.hash.indexOf(errorKey) !== -1) {
          let hash = window.location.hash;
          let errorStart = hash.indexOf(errorKey);
          let error = hash.slice(errorStart + errorKey.length).split("&")[0];
          let problemDetail = JSON.parse(
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
