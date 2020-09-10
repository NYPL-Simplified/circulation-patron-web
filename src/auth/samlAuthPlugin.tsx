import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import SamlAuthForm from "./SamlAuthForm";
import AuthButton from "./AuthButton";
import { OPDS1, ClientSamlMethod } from "interfaces";

const samlAuthPlugin: AuthPlugin<ClientSamlMethod> = {
  buttonComponent: AuthButton,
  lookForCredentials: () => null,
  type: OPDS1.SamlAuthType,
  formComponent: SamlAuthForm
};

export default samlAuthPlugin;
