/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useDialogState } from "reakit/Dialog";
import useLibraryContext from "../components/context/LibraryContext";
import Modal, { modalButtonStyles } from "../components/Modal";
import ClientOnly from "../components/ClientOnly";
import { H2, Text } from "../components/Text";
import FormLabel from "../components/form/FormLabel";
import Select from "../components/Select";
import Stack from "../components/Stack";
import { AppAuthMethod, OPDS1 } from "interfaces";
import BasicAuthForm from "auth/BasicAuthForm";
import SamlAuthButton from "auth/SamlAuthButton";
import CleverButton from "auth/CleverButton";
import { AuthModalProvider } from "auth/AuthModalContext";
import useUser from "components/context/UserContext";
import Button from "components/Button";
import ExternalLink from "components/ExternalLink";

const AuthForm: React.FC = ({ children }) => {
  const dialog = useDialogState();
  const { hide } = dialog;
  const { catalogName, authMethods } = useLibraryContext();
  const { isAuthenticated } = useUser();
  /**
   * If the user becomes authenticated, we can hide the form
   */
  React.useEffect(() => {
    if (isAuthenticated) hide();
  }, [isAuthenticated, hide]);

  /**
   * The options:
   *  - No auth methods available. Tell the user.
   *  - There is only one method. Show the form for that one.
   *  - There are 1-5 methods. Show a button for each.
   *  - There are >5 methods. Show a combobox selector.
   */
  const formStatus =
    authMethods.length === 0
      ? "no-auth"
      : authMethods.length === 1
      ? "single-auth"
      : authMethods.length < 5
      ? "buttons"
      : "combobox";

  return (
    <React.Fragment>
      <ClientOnly>
        <Modal
          isVisible={dialog.visible}
          hide={dialog.hide}
          label="Sign In Form"
          dialog={dialog}
          sx={{ p: 5 }}
        >
          <div sx={{ textAlign: "center", p: 0 }}>
            <H2>{catalogName}</H2>
            <h4>Login</h4>
          </div>
          {formStatus === "no-auth" ? (
            <NoAuth />
          ) : formStatus === "single-auth" ? (
            <SignInForm method={authMethods[0]} />
          ) : formStatus === "combobox" ? (
            <Combobox authMethods={authMethods} />
          ) : (
            <Buttons authMethods={authMethods} />
          )}
        </Modal>
      </ClientOnly>
      {/* We render this to provide the dialog a focus target after it closes
          even though we don't open the dialog with a button
      */}
      {/* <DialogDisclosure sx={{ display: "none" }} {...dialog} /> */}
      <AuthModalProvider showModal={dialog.show}>{children}</AuthModalProvider>
    </React.Fragment>
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
                <Button
                  key={method.type}
                  sx={{ ...modalButtonStyles }}
                  onClick={() => handleChangeMethod(OPDS1.BasicAuthType)}
                >
                  Login with {method.description ?? "Basic Auth"}
                </Button>
              );
            case OPDS1.SamlAuthType:
              return <SamlAuthButton method={method} key={method.type} />;
            case OPDS1.CleverAuthType:
              return <CleverButton method={method} key={method.type} />;
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
    const method = getMethodForId(authMethods, id);
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
          <option key={method.type} value={getIdForMethod(method)}>
            {method.description}
          </option>
        ))}
      </Select>
      <SignInForm method={selectedMethod} />
    </div>
  );
};

// there is no id on auth methods, so we have to use the type
// or the href if it's saml
function getIdForMethod(method: AppAuthMethod) {
  return method.type === OPDS1.SamlAuthType ? method.href : method.type;
}
function getMethodForId(
  authMethods: AppAuthMethod[],
  id: string
): AppAuthMethod | undefined {
  return authMethods.find(
    method =>
      method.type === id ||
      (method.type === OPDS1.SamlAuthType && method.href === id)
  );
}

export default AuthForm;
