import * as React from "react";
import { AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import Button from "components/Button";

export interface AuthLink {
  rel: string;
  href: string;
}

export interface CleverAuthMethod extends AuthMethod {
  links?: AuthLink[];
}

const CleverButton: React.FC<AuthButtonProps<CleverAuthMethod>> = props => {
  const { actions, dispatch } = useActions();

  const currentUrl = window.location.origin + window.location.pathname;
  let authUrl;

  for (const link of props?.provider?.method.links || []) {
    if (link.rel === "authenticate") {
      authUrl =
        link.href +
        "&redirect_uri=" +
        encodeURIComponent(encodeURIComponent(currentUrl));

      break;
    }
  }

  return authUrl ? (
    <a href={authUrl}>
      <Button
        onClick={() =>
          dispatch(
            actions.saveAuthCredentials({
              provider: "Clever",
              credentials: ""
            })
          )
        }
        type="submit"
        sx={{
          alignSelf: "flex-end",
          m: 2,
          mr: 0,
          flex: "1 0 auto",
          color: "#ffffff",
          backgroundColor: "#2f67aa",
          backgroundImage: "url('./cleverLoginButton.png')"
        }}
        aria-label="log in with clever"
      >
        Log In With Clever
      </Button>
    </a>
  ) : null;
};

export default CleverButton;
