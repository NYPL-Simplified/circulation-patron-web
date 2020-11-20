/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "../components/context/LibraryContext";
import { H2, Text } from "../components/Text";
import FormLabel from "../components/form/FormLabel";
import Select from "../components/Select";
import Stack from "../components/Stack";
import { AppAuthMethod, OPDS1 } from "interfaces";
import BasicAuthForm from "auth/BasicAuthForm";
import SamlAuthButton from "auth/SamlAuthButton";
import CleverButton from "auth/CleverAuthButton";
import useUser from "components/context/UserContext";
import Button from "components/Button";
import ExternalLink from "components/ExternalLink";
import BasicAuthButton from "auth/BasicAuthButton";
import LoadingIndicator from "components/LoadingIndicator";
import extractParam from "dataflow/utils";
import useLinkUtils from "hooks/useLinkUtils";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";

const Login = () => {
  const { isLoading, isAuthenticated } = useUser();
  const { catalogName, authMethods } = useLibraryContext();
  const { buildMultiLibraryLink } = useLinkUtils();
  const { push, query } = useRouter();
  const redirectUrl = extractParam(query, LOGIN_REDIRECT_QUERY_PARAM);

  const successUrl = redirectUrl || buildMultiLibraryLink("/");
  const success = React.useCallback(() => {
    push(successUrl, undefined, { shallow: true });
  }, [push, successUrl]);

  /**
   * If the user becomes authenticated, we can hide the form
   */
  React.useEffect(() => {
    if (isAuthenticated) success();
  }, [isAuthenticated, success]);

  /**
   * The options:
   *  - No auth methods available. Tell the user.
   *  - There is only one method. Show the form for that one.
   *  - There are 1-5 methods. Show a button for each.
   *  - There are >5 methods. Show a combobox selector.
   */
  const formStatus = isLoading
    ? "loading"
    : authMethods.length === 0
    ? "no-auth"
    : authMethods.length === 1
    ? "single-auth"
    : authMethods.length < 5
    ? "buttons"
    : "combobox";

  return (
    <div
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div sx={{ p: 4, border: "solid", borderRadius: "card" }}>
        <div sx={{ textAlign: "center", p: 0 }}>
          <H2>{catalogName}</H2>
          {formStatus !== "loading" && <h4>Login</h4>}
        </div>
        {formStatus === "loading" ? (
          <Stack direction="column" sx={{ alignItems: "center" }}>
            <LoadingIndicator />
            Logging in...
          </Stack>
        ) : formStatus === "no-auth" ? (
          <NoAuth />
        ) : formStatus === "single-auth" ? (
          <SignInForm method={authMethods[0]} />
        ) : formStatus === "combobox" ? (
          <Combobox authMethods={authMethods} />
        ) : (
          <Buttons authMethods={authMethods} />
        )}
      </div>
    </div>
  );
};

/**
 * Renders a form if there is one, or a button, or tells
 * the user that the auth method is not supported.
 */
const SignInForm: React.FC<{
  method: AppAuthMethod;
}> = ({ method }) => {
  switch (method.type) {
    case OPDS1.BasicAuthType:
      return <BasicAuthForm method={method} />;
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
 * If you click a button that leads to a form, it will show the form.
 * If you click one that leads to external site, it will take you there
 * instead.
 */
const Buttons: React.FC<{
  authMethods: AppAuthMethod[];
}> = ({ authMethods }) => {
  const [selectedMethod, setSelectedMethod] = React.useState<
    AppAuthMethod | undefined
  >(undefined);

  const handleChangeMethod = (type: string) => {
    const method = authMethods.find(method => method.type === type);
    if (method) setSelectedMethod(method);
  };

  const cancelSelection = () => setSelectedMethod(undefined);

  return (
    <Stack direction="column" aria-label="Available authentication methods">
      {!selectedMethod &&
        authMethods.map(method => {
          switch (method.type) {
            case OPDS1.BasicAuthType:
              return (
                <BasicAuthButton
                  key={method.id}
                  method={method}
                  onClick={() => handleChangeMethod(OPDS1.BasicAuthType)}
                />
              );
            case OPDS1.SamlAuthType:
              return <SamlAuthButton method={method} key={method.id} />;
            case OPDS1.CleverAuthType:
              return <CleverButton method={method} key={method.id} />;
            default:
              return null;
          }
        })}
      {selectedMethod && (
        <Stack direction="column">
          <SignInForm method={selectedMethod} />
          <Button
            onClick={cancelSelection}
            variant="ghost"
            color="ui.gray.dark"
            sx={{ alignSelf: "center" }}
          >
            Back to selection
          </Button>
        </Stack>
      )}
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
      <SignInForm method={selectedMethod} />
    </div>
  );
};

export default Login;
