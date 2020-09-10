import { OPDS1 } from "interfaces";
import CleverButton from "auth/cleverAuthButton";
import { AuthPlugin } from "auth/authPlugins";

const cleverAuthPlugin: AuthPlugin<OPDS1.CleverAuthMethod> = {
  lookForCredentials: () => {
    // Check for Clever auth
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
            provider: "Clever",
            credentials: "Bearer " + accessToken
          };
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
  button: CleverButton,
  form: CleverButton
};

export default cleverAuthPlugin;
