/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import useLibraryContext from "./context/LibraryContext";
import useAuth from "../hooks/useAuth";
import { getBasicAuthProvider } from "../utils/auth";
import Modal from "./Modal";
import ClientOnly from "./ClientOnly";

/**
 *  - makes sure auth state is loaded from cookies
 *  - shows auth form modal based on redux state (showForm)
 *  - uses the AuthPlugin system to render the auth form
 */
const Auth: React.FC = ({ children }) => {
  /**
   * Get the auth providers from the redux store.
   * If you want to support multiple auth providers,
   * you should make this selectable
   *
   * this hook also makes sure that the credentials are loaded
   * from cookies, at least for basic auth
   */
  const { showForm, cancel, providers } = useAuth();
  /**
   * We only support BasicAuth currently, but if you want to support more
   * then you should allow a user to choose one of these auth providers
   */
  const basicAuthProvider = getBasicAuthProvider(providers);
  const BasicAuthComponent = basicAuthProvider?.plugin?.formComponent;

  // we use some properties from this hook,
  // but the visibility is in redux state
  const dialog = useDialogState();
  const library = useLibraryContext();
  return (
    <React.Fragment>
      {/* <DialogDisclosure {...dialog} visible={isVisible} toggle={toggle}>
        Open dialog
      </DialogDisclosure> */}
      <ClientOnly>
        <Modal
          isVisible={showForm}
          hide={cancel ?? undefined}
          label="Sign In"
          dialog={dialog}
        >
          <div sx={{ textAlign: "center" }}>
            <Styled.h2>{library.catalogName}</Styled.h2>
            <Styled.h4>Login</Styled.h4>
          </div>
          {/* Here we render the auth plugins  */}
          {/* if you would like to enable alternative auth plugins */}
          {/* you should render them (or some way to choose one) here */}
          {BasicAuthComponent && basicAuthProvider && showForm ? (
            <BasicAuthComponent provider={basicAuthProvider} />
          ) : (
            "Basic auth provider is missing."
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
