import BasicAuthForm from "./BasicAuthForm";
import AuthButton from "./AuthButton";
import { OPDS1 } from "interfaces";
import { AuthPlugin } from "auth/authPlugins";

const basicAuthPlugin: AuthPlugin<OPDS1.BasicAuthMethod> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  lookForCredentials: () => {},
  form: BasicAuthForm,
  button: AuthButton
};

export default basicAuthPlugin;
