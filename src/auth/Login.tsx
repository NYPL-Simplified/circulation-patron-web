/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "../components/context/LibraryContext";
import { H2, Text } from "../components/Text";
import FormLabel from "../components/form/FormLabel";
import Select from "../components/Select";
import Stack from "../components/Stack";
import { AppAuthMethod, OPDS1 } from "interfaces";
import BasicAuthHandler from "auth/BasicAuthHandler";
import SamlAuthButton from "auth/SamlAuthHandler";
import CleverButton from "auth/CleverAuthHandler";
import useUser from "components/context/UserContext";
import ExternalLink from "components/ExternalLink";
import AuthButton from "auth/AuthButton";
import LoadingIndicator from "components/LoadingIndicator";
import extractParam from "dataflow/utils";
import useLinkUtils from "hooks/useLinkUtils";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";

/**
 * TODO:
 *  - Handle single method auto-select
 *  - Handle combobox
 */

const Login = () => {
  const { isLoading, isAuthenticated } = useUser();
  const { catalogName, authMethods } = useLibraryContext();
  const { buildMultiLibraryLink } = useLinkUtils();
  const { push, query } = useRouter();
  const methodId = query?.methodId?.[0];
  const selectedMethod = authMethods.find(m => m.id === methodId);
  const redirectUrl = extractParam(query, LOGIN_REDIRECT_QUERY_PARAM);

  // the success url is the catalog root if none is set in the url param.
  const successUrl = redirectUrl || buildMultiLibraryLink("/");
  const success = React.useCallback(() => {
    push(successUrl, undefined, { shallow: true });
  }, [push, successUrl]);

  /**
   * If the user becomes authenticated, we can redirect
   * to the successUrl
   */
  React.useEffect(() => {
    if (isAuthenticated) success();
  }, [isAuthenticated, success]);

  /**
   * The options:
   *  - Loading the user state. Show a spinner.
   *  - No auth methods available. Tell the user.
   *  - There is only one method. (TODO: automatically select it)
   *  - There are 1-5 methods. Show the buttons-based flow.
   *  - There are >5 methods. Show the combobox flow.
   *  - An auth method is selected. Render the handler.
   */
  const formStatus = isLoading
    ? "loading"
    : selectedMethod
    ? "method-selected"
    : authMethods.length === 0
    ? "no-auth"
    : authMethods.length < 5
    ? "buttons"
    : "combobox";

  // redirect user automatically to apropriate method if there is
  // only one auth method
  React.useEffect(() => {
    if (authMethods.length === 1 && !selectedMethod) {
      const singleAuthUrl = buildMultiLibraryLink(
        `/login/${encodeURIComponent(authMethods[0].id)}`
      );
      push(singleAuthUrl);
    }
  }, [push, authMethods, buildMultiLibraryLink, selectedMethod]);

  return (
    <div
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Stack
        direction="column"
        sx={{ p: 4, border: "solid", borderRadius: "card" }}
      >
        <div sx={{ textAlign: "center", p: 0 }}>
          <H2>{catalogName}</H2>
          {formStatus !== "loading" && <h4>Login</h4>}
        </div>
        {formStatus === "loading" ? (
          <Stack direction="column" sx={{ alignItems: "center" }}>
            <LoadingIndicator />
            Logging in...
          </Stack>
        ) : formStatus === "method-selected" ? (
          <AuthHandler method={selectedMethod!} />
        ) : formStatus === "no-auth" ? (
          <NoAuth />
        ) : formStatus === "combobox" ? (
          <Combobox authMethods={authMethods} />
        ) : (
          <Buttons authMethods={authMethods} />
        )}
      </Stack>
    </div>
  );
};

/**
 * Renders the apropriate handler for the selected method. for basic auth
 * this means showing a form. For clever/oauth this means redirecting
 * externally.
 */
export const AuthHandler: React.FC<{
  method: AppAuthMethod;
}> = ({ method }) => {
  switch (method.type) {
    case OPDS1.BasicAuthType:
      return <BasicAuthHandler method={method} />;
    case OPDS1.SamlAuthType:
      return <SamlAuthButton method={method} />;
    case OPDS1.CleverAuthType:
      return <CleverButton method={method} />;
    default:
      return <p>This authentication method is not supported.</p>;
  }
};

const NoAuth: React.FC = () => {
  const {
    libraryLinks: { helpEmail }
  } = useLibraryContext();
  return (
    <div sx={{ display: "flex", justifyContent: "center", maxWidth: 500 }}>
      <Text>
        This Library does not have any authentication configured.{" "}
        {helpEmail && (
          <Text>
            If this is an error, please contact your site administrator via
            email at:{" "}
            <ExternalLink
              role="link"
              href={helpEmail.href}
              aria-label="Send email to help desk"
            >
              {helpEmail.href.replace("mailto:", "")}
            </ExternalLink>
            .
          </Text>
        )}
      </Text>
    </div>
  );
};

/**
 * Renders buttons that allow selecting between auth providers.
 */
const Buttons: React.FC<{
  authMethods: AppAuthMethod[];
}> = ({ authMethods }) => {
  return (
    <Stack direction="column" aria-label="Available authentication methods">
      {authMethods.map(method => (
        <AuthButton key={method.id} method={method} />
      ))}
    </Stack>
  );
};

/**
 * Renders a combobox style auth method selector.
 */
const Combobox: React.FC<{
  authMethods: AppAuthMethod[];
}> = ({ authMethods }) => {
  const [selectedMethod, setSelectedMethod] = React.useState<AppAuthMethod>(
    authMethods[0]
  );

  const handleChangeMethod = (id: string) => {
    const method = authMethods.find(m => m.id === id);
    if (method) setSelectedMethod(method);
  };

  return (
    <div sx={{ mb: 2 }}>
      <FormLabel htmlFor="login-method-select">Login Method</FormLabel>
      <Select
        aria-label="Choose login method"
        id="login-method-select"
        onChange={e => handleChangeMethod(e.target.value)}
      >
        {authMethods?.map(method => (
          <option key={method.id} value={method.id}>
            {method.description}
          </option>
        ))}
      </Select>
      <AuthButton method={selectedMethod} />
    </div>
  );
};

export default Login;
