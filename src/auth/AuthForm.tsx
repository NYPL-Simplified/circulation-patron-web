/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import useLibraryContext from "../components/context/LibraryContext";
import Modal from "../components/Modal";
import ClientOnly from "../components/ClientOnly";
import { H2 } from "../components/Text";
import FormLabel from "../components/form/FormLabel";
import Select from "../components/Select";
import Stack from "../components/Stack";
import { AppAuthMethod, OPDS1 } from "interfaces";
import BasicAuthForm from "auth/BasicAuthForm";
import SamlAuthButton from "auth/SamlAuthButton";
import CleverButton from "auth/cleverAuthButton";
import BasicAuthButton from "auth/AuthButton";
import { AuthFormProvider } from "auth/AuthFormCotext";
import useUser from "hooks/useUser";

const AuthForm: React.FC = ({ children }) => {
  const dialog = useDialogState();
  const { hide } = dialog;
  const { catalogName, authMethods } = useLibraryContext();
  const { isAuthenticated } = useUser();

  const [selectedMethod, setSelectedMethod] = React.useState<
    AppAuthMethod | undefined
  >(undefined);

  const handleChangeMethod = (type: string) => {
    const method = authMethods.find(method => method.type === type);
    if (method) setSelectedMethod(method);
  };

  const cancelGoBackToAuthSelection = () => {
    setSelectedMethod(undefined);
  };

  /**
   * If the user becomes authenticated, we can hide the form
   */
  React.useEffect(() => {
    if (isAuthenticated) hide();
  }, [isAuthenticated, hide]);

  /**
   * The options:
   *  - A method is selected, show the form.
   *  - No auth methods available. Tell the user.
   *  - There is only one method. Show the form for that one.
   *  - There are 1-5 methods. Show a button for each.
   *  - There are >5 methods. Show a combobox selector.
   */
  const selectionMode =
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
          {selectedMethod ? (
            <SignInForm
              method={selectedMethod}
              goBackToSelection={cancelGoBackToAuthSelection}
            />
          ) : selectionMode === "no-auth" ? (
            <NoAuth />
          ) : selectionMode === "single-auth" ? (
            <SignInForm method={authMethods[0]} />
          ) : selectionMode === "combobox" ? (
            <Combobox
              authMethods={authMethods}
              handleChangeMethod={handleChangeMethod}
            />
          ) : (
            <Buttons
              authMethods={authMethods}
              handleChangeMethod={handleChangeMethod}
            />
          )}

          {/* <Button
            onClick={() =>
              authProvider && (visibleProviders?.length ?? 0) > 1
                ? cancelGoBackToAuthSelection()
                : typeof cancel === "function" && cancel()
            }
            sx={{
              ...modalButtonStyles
            }}
            variant="ghost"
          >
            Cancel
          </Button> */}
        </Modal>
      </ClientOnly>
      {/* We render this to provide the dialog a focus target after it closes
          even though we don't open the dialog with a button
      */}
      <DialogDisclosure sx={{ display: "none" }} {...dialog} />
      <AuthFormProvider showForm={dialog.show}>{children}</AuthFormProvider>
    </React.Fragment>
  );
};

/**
 * Renders a form if there is one, or a button, or tells
 * the user that the auth method is not supported.
 */
const SignInForm: React.FC<{
  method: AppAuthMethod;
  goBackToSelection?: () => void;
}> = ({ method, goBackToSelection: _ }) => {
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
  return <div>No auth configured</div>;
};

const Buttons: React.FC<{
  authMethods: AppAuthMethod[];
  handleChangeMethod: (type: string) => void;
}> = ({ authMethods, handleChangeMethod }) => {
  return (
    <Stack direction="column">
      {authMethods.map(method => {
        switch (method.type) {
          case OPDS1.BasicAuthType:
            return (
              <BasicAuthButton
                method={method}
                key={method.type}
                onClick={handleChangeMethod}
              />
            );
          case OPDS1.SamlAuthType:
            return <SamlAuthButton method={method} key={method.type} />;
          case OPDS1.CleverAuthType:
            return <CleverButton method={method} key={method.type} />;
          default:
            return null;
        }
      })}
    </Stack>
  );
};

const Combobox: React.FC<{
  authMethods: AppAuthMethod[];
  handleChangeMethod: (type: string) => void;
}> = ({ authMethods, handleChangeMethod }) => {
  return (
    <div sx={{ mb: 2 }}>
      <FormLabel htmlFor="login-method-select">Login Method</FormLabel>
      <Select
        id="login-method-select"
        onChange={e => handleChangeMethod(e.target.value)}
      >
        {authMethods?.map(method => (
          <option key={method.type} value={method.type}>
            {method.description}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default AuthForm;
