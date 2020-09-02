import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import SamlAuthForm from "./SamlAuthForm";
import AuthButton from "./AuthButton";
import { SamlAuthType } from "interfaces";

const samlAuthPlugin: AuthPlugin = {
  buttonComponent: AuthButton,
  lookForCredentials: () => null,
  type: SamlAuthType,
  formComponent: SamlAuthForm
};

export default samlAuthPlugin;
