import AuthPlugin from "opds-web-client/lib/AuthPlugin";

const OAuthPlugin: AuthPlugin = {
  buttonComponent: () => null,
  lookForCredentials: () => null,
  type: "OAuth",
  formComponent: () => null
};

export default OAuthPlugin;
