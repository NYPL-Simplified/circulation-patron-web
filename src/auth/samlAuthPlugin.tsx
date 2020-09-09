import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import SamlAuthForm from "./SamlAuthForm";
import AuthButton from "./AuthButton";
import { OPDS1 } from "interfaces";

const samlAuthPlugin: AuthPlugin = {
  buttonComponent: AuthButton,
  lookForCredentials: () => null,
  type: OPDS1.SamlAuthType,
  formComponent: SamlAuthForm
};

export default samlAuthPlugin;
