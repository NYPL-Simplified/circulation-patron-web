import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import SamlAuthForm from "./SamlAuthForm";
import AuthButton from "./AuthButton";
import { ClientSamlMethod } from "opds-web-client/lib/interfaces";

const samlAuthPlugin: AuthPlugin<ClientSamlMethod> = {
  buttonComponent: AuthButton,
  lookForCredentials: () => null,
  type: "http://librarysimplified.org/authtype/SAML-2.0",
  formComponent: SamlAuthForm
};

export default samlAuthPlugin;
