/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import useLibraryContext from "./context/LibraryContext";
import useAuth from "../hooks/useAuth";
import Modal from "./Modal";
import ClientOnly from "./ClientOnly";
import { H2 } from "./Text";
import Select from "./Select";
import FormLabel from "./form/FormLabel";

/**
 *  - makes sure auth state is loaded from cookies
 *  - shows auth form modal based on redux state (showForm)
 *  - uses the AuthPlugin system to render the auth form
 */
const Auth: React.FC = ({ children }) => {
  const { showForm, cancel, providers } = useAuth();
  const dialog = useDialogState();
  const library = useLibraryContext();
  const [authProvider, setAuthProvider] = React.useState(providers?.[0]);

  // the providers get set when the form is shown, so
  // it's initially undefined. We need to update when they get set
  React.useEffect(() => {
    if (!authProvider) setAuthProvider(providers?.[0]);
  }, [authProvider, providers]);

  const handleChangeProvider: React.ChangeEventHandler<HTMLSelectElement> = e => {
    setAuthProvider(
      providers?.find(provider => provider.id === e.target.value)
    );
  };

  const hasMultipleProviders = providers?.length !== 1;

  return (
    <React.Fragment>
      <ClientOnly>
        <Modal
          isVisible={showForm}
          hide={cancel ?? undefined}
          label="Sign In Form"
          dialog={dialog}
          sx={{ p: 5 }}
        >
          <div sx={{ textAlign: "center", p: 0 }}>
            <H2>{library.catalogName}</H2>
            <h4>Login</h4>
          </div>
          {hasMultipleProviders && (
            <div sx={{ mb: 2 }}>
              <FormLabel htmlFor="login-method-select">Login Method</FormLabel>
              <Select id="login-method-select" onChange={handleChangeProvider}>
                {providers?.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.method.description}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {authProvider && authProvider.plugin.formComponent ? (
            <authProvider.plugin.formComponent provider={authProvider} />
          ) : (
            "There is no Auth Plugin configured for the selected Auth Provider."
          )}
        </Modal>
      </ClientOnly>
      {/* We render this to provide the dialog a focus target after it closes
          even though we don't open the dialog with a button
      */}
      <DialogDisclosure sx={{ display: "none" }} {...dialog} />
      {children}
    </React.Fragment>
  );
};

export default Auth;
