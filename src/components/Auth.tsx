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

  //  ChangeEventHandler<MouseEvent>
  const handleChangeProvider: React.MouseEvent<
    HTMLButtonElement,
    MouseEvent
  > = (e: { target: { value: string } }) => {
    setAuthProvider(
      providers?.find(provider => provider.id === e.target.value)
    );
  };

  const cancelGoBackToAuthSelection: React.MouseEvent<
    HTMLButtonElement,
    MouseEvent
  > = () => {
    setAuthProvider(undefined);
  };

  const hasMultipleProviders = providers?.length !== 1;

  const showFormComponent = authProvider && authProvider.plugin.formComponent;

  const showButtonComponent =
    authProvider &&
    authProvider.plugin.buttonComponent &&
    authProvider.method.description === "Clever";

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

          {hasMultipleProviders && !authProvider && (
            <div sx={{ mb: 2, textAlign: `center` }}>
              {/* what accessibility markup should be used here 
               <FormLabel htmlFor="login-method-select">Login Method</FormLabel> */}

              <div>
                {providers?.map(provider => (
                  <div>
                    {" "}
                    {/* todo: make buttons block elements without extra div*/}
                    {provider.plugin && (
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
                      provider.id === "Clever" && (
                        <provider.plugin.buttonComponent
                          key={provider.id}
                          provider={provider}
                        />
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {authProvider && authProvider.plugin.formComponent && (
            <authProvider.plugin.formComponent provider={authProvider} />
          )}
          {authProvider && showButtonComponent && (
            <authProvider.plugin.buttonComponent provider={authProvider} />
          )}

          <Button
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
