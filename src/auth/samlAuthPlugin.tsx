import AuthPlugin from "opds-web-client/lib/AuthPlugin";

const samlAuthPlugin: AuthPlugin = {
  buttonComponent: () => null,
  lookForCredentials: () => null,
  type: "http://librarysimplified.org/authtype/SAML-2.0",
  formComponent: () => null
};

export default samlAuthPlugin;
