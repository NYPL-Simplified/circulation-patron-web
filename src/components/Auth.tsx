/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import useLibraryContext from "./context/LibraryContext";
import useAuth from "../hooks/useAuth";
import Modal from "./Modal";
import ClientOnly from "./ClientOnly";
import { H2 } from "./Text";
import Button from "components/Button";
import BasicAuthButton from "../auth/BasicAuthButton";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import useTypedSelector from "hooks/useTypedSelector";
import FormLabel from "./form/FormLabel";
import Select from "./Select";
import { AuthProvider, AuthMethod } from "opds-web-client/lib/interfaces";
/**
 *  - makes sure auth state is loaded from cookies
 *  - shows auth form modal based on redux state (showForm)
 *  - uses the AuthPlugin system to render the auth form
 */
const Auth: React.FC = ({ children }) => {
  const { showForm, cancel, providers } = useAuth();

  const dialog = useDialogState();
  const library = useLibraryContext();
  const [authProvider, setAuthProvider] = React.useState(
    [][0] as AuthProvider<AuthMethod>
  );

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

  const handleChangeProvider = (e: { target: { value: string } }) => {
    setAuthProvider(
      providers?.find(provider => provider.id === e.target.value) ||
        ([][0] as AuthProvider<AuthMethod>)
    );
  };

  const cancelGoBackToAuthSelection = () => {
    setAuthProvider([][0] as AuthProvider<AuthMethod>);
  };

  const showProviderButtons =
    providers && providers?.length > 1 && providers?.length <= 4;

  const showProviderComboBox = providers && providers?.length > 4;

  const showFormComponent = authProvider && authProvider?.plugin?.formComponent;

  const showButtonComponent =
    authProvider?.plugin?.buttonComponent &&
    authProvider?.method?.description === "Clever";

  const noAuth = !showFormComponent && !showButtonComponent;

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
              <Select id="login-method-select" onChange={handleChangeProvider}>
                {providers?.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.method.description}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {showProviderButtons && !authProvider && (
            <div sx={{ mb: 2, textAlign: `center` }}>
              {/* what accessibility markup should be used here */}
              <FormLabel htmlFor="login-method-select">Login Method</FormLabel>

              <ul
                sx={{
                  padding: 0,
                  margin: 0,
                  listStyleType: "none"
                }}
              >
                {providers?.map(provider => (
                  <li>
                    {provider.plugin &&
                      provider.method.description !== "Clever" && (
                        <BasicAuthButton
                          links={provider.method.links || []}
                          aria-label={`Login to ${provider.method.description}`}
                          key={provider.id}
                          value={provider.id}
                          onClick={handleChangeProvider}
                        >
                          {provider.method.description}
                        </BasicAuthButton>
                      )}
                    {provider.plugin.buttonComponent &&
                      provider.method.description === "Clever" && (
                        <provider.plugin.buttonComponent
                          key={provider.id}
                          provider={provider}
                        />
                      )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {authProvider && authProvider.plugin.formComponent && (
            <authProvider.plugin.formComponent provider={authProvider} />
          )}
          {authProvider && showButtonComponent && (
            <authProvider.plugin.buttonComponent provider={authProvider} />
          )}

          <Button
            // TO-DO resolve type issue
            // @ts-ignore
            onClick={
              authProvider && providers && providers.length > 1
                ? cancelGoBackToAuthSelection
                : cancel
            }
            sx={{
              alignSelf: "flex-end",
              m: 2,
              mr: 0,
              flex: "1 0 auto",
              width: "280px",
              height: "51px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0",
              cursor: "pointer",
              border: "none"
            }}
            variant="ghost"
          >
            Cancel
          </Button>

          {authProvider &&
            noAuth &&
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
