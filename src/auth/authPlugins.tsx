import basicAuthPlugin from "auth/basicAuthPlugin";
import cleverAuthPlugin from "auth/cleverAuthPlugin";
import samlAuthPlugin from "auth/samlAuthPlugin";
import { AppAuthMethod, OPDS1 } from "interfaces";

export type AuthFormProps<TMethod extends AppAuthMethod> = {
  method: TMethod;
};
export type AuthButtonProps<TMethod extends AppAuthMethod> = {
  method: TMethod;
};

export type AuthPlugin<TMethod extends AppAuthMethod> = {
  form: React.ComponentType<AuthFormProps<TMethod>>;
  button: React.ComponentType<AuthButtonProps<TMethod>>;
  lookForCredentials: () => void;
};

const authPlugins = {
  [OPDS1.BasicAuthType]: basicAuthPlugin,
  [OPDS1.SamlAuthType]: samlAuthPlugin,
  [OPDS1.CleverAuthType]: cleverAuthPlugin,
  [OPDS1.ImplicitGrantAuthType]: undefined,
  [OPDS1.PasswordCredentialsAuthType]: undefined
};

export default authPlugins;
