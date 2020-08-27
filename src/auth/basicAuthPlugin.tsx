import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import BasicAuthForm from "./BasicAuthForm";
import AuthButton from "./AuthButton";

const BasicAuthPlugin: AuthPlugin = {
  type: "http://opds-spec.org/auth/basic",

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  lookForCredentials: () => {},

  formComponent: BasicAuthForm,
  buttonComponent: AuthButton
};

export default BasicAuthPlugin;
