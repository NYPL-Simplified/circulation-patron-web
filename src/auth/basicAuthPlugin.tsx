import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import BasicAuthForm from "./BasicAuthForm";
import AuthButton from "./AuthButton";
import { BasicAuthType } from "interfaces";

const BasicAuthPlugin: AuthPlugin = {
  type: BasicAuthType,

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  lookForCredentials: () => {},

  formComponent: BasicAuthForm,
  buttonComponent: AuthButton
};

export default BasicAuthPlugin;
