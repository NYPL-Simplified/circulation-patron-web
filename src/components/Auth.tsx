/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import useLibraryContext from "./context/LibraryContext";
import useAuth from "../hooks/useAuth";
import Modal, { modalButtonStyles } from "./Modal";
import ClientOnly from "./ClientOnly";
import { H2 } from "./Text";
import Button from "components/Button";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import useTypedSelector from "hooks/useTypedSelector";
import FormLabel from "./form/FormLabel";
import Select from "./Select";
import Stack from "./Stack";
import { AuthProvider, AuthMethod } from "opds-web-client/lib/interfaces";
/**
 *  - makes sure auth state is loaded from cookies
 *  - shows auth form modal based on redux state (showForm)
 *  - uses the AuthPlugin system to render the auth form
 */

function shouldShowButton(
  authProvider: AuthProvider<AuthMethod> | undefined
): boolean {
  return Boolean(
    authProvider?.plugin?.buttonComponent &&
      authProvider?.method?.description === "Clever"
  );
}

function shouldShowFormComponent(
  authProvider: AuthProvider<AuthMethod>
): boolean {
  return Boolean(authProvider.plugin.formComponent);
}
const Auth: React.FC = ({ children }) => {
  const { showForm, cancel, providers } = useAuth();

  const dialog = useDialogState();
  const library = useLibraryContext();
  const [authProvider, setAuthProvider] = React.useState<
    AuthProvider<AuthMethod> | undefined
  >(undefined);

  const { fetcher, actions, dispatch } = useActions();

  /**
   * This component is responsible for fetching loans whenever the
   * auth credentials change
   */
  const { provider: currentProvider, credentials } =
    fetcher.getAuthCredentials() ?? {};
  const loansUrl = useTypedSelector(state => state.loans.url);
  React.useEffect(() => {
    if (currentProvider && credentials) {
      dispatch(
        actions.saveAuthCredentials({ provider: currentProvider, credentials })
      );
      if (loansUrl) dispatch(actions.fetchLoans(loansUrl));
    }
  }, [currentProvider, credentials, loansUrl, actions, dispatch]);

  // the providers get set when the form is shown, so
  // it's initially undefined. We need to update when they get set
  React.useEffect(() => {
    if (!authProvider && providers?.length === 1)
      setAuthProvider(providers?.[0]);
  }, [authProvider, providers]);

  const handleChangeProvider = (providerId: string) => {
    setAuthProvider(providers?.find(provider => provider.id === providerId));
  };

  const cancelGoBackToAuthSelection = () => {
    setAuthProvider(undefined);
  };

  const visibleProviders = providers?.filter(
    provider => shouldShowButton(provider) || shouldShowFormComponent(provider)
  );

  const noAuth = (visibleProviders?.length ?? 0) === 0;

  const showProviderComboBox = (visibleProviders?.length ?? 0) > 4;

  const showProviderButtons =
    (visibleProviders?.length ?? 0) > 1 && (visibleProviders?.length ?? 0) <= 4;

  const showButtonComponent = shouldShowButton(authProvider);

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

          {showProviderComboBox && (
            <div sx={{ mb: 2 }}>
              <FormLabel htmlFor="login-method-select">Login Method</FormLabel>
              <Select
                id="login-method-select"
                onChange={e => handleChangeProvider(e.target.value)}
              >
                {providers?.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.method.description}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {showProviderButtons && !authProvider && (
            <Stack direction="column">
              {providers?.map((provider, idx) => (
                <>
                  {provider.plugin.buttonComponent && (
                    <provider.plugin.buttonComponent
                      key={`${provider.id}${idx}`}
                      provider={provider}
                      onClick={() => handleChangeProvider(provider.id)}
                    />
                  )}
                </>
              ))}
            </Stack>
          )}
          {authProvider && authProvider.plugin.formComponent && (
            <authProvider.plugin.formComponent provider={authProvider} />
          )}
          {authProvider && showButtonComponent && (
            <authProvider.plugin.buttonComponent provider={authProvider} />
          )}

          <Button
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
          </Button>

          {noAuth &&
            "There is no Auth Plugin configured for the selected Auth Provider."}
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
