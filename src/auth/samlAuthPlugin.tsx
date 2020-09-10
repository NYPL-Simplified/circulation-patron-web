import { ClientSamlMethod } from "interfaces";
import SamlAuthButton from "auth/SamlAuthButton";
import { AuthPlugin } from "auth/authPlugins";

const samlAuthPlugin: AuthPlugin<ClientSamlMethod> = {
  button: SamlAuthButton,
  form: SamlAuthButton,
  lookForCredentials: () => null
};

export default samlAuthPlugin;
