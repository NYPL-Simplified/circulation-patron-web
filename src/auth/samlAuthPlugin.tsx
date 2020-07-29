import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import SamlAuthForm from "./SamlAuthForm";

const samlAuthPlugin: AuthPlugin = {
  buttonComponent: () => null,
  lookForCredentials: () => null,
  type: "http://librarysimplified.org/authtype/SAML-2.0",
  formComponent: SamlAuthForm
};

export default samlAuthPlugin;
