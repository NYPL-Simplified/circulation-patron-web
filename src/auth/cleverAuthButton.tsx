import * as React from "react";
import { AuthProvider, AuthMethod } from "opds-web-client/lib/interfaces";

import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import Button from "components/Button";

import { modalButtonStyles } from "components/Modal";

export function getAuthUrl(
  provider: AuthProvider<AuthMethod>,
  currentUrl: string
) {
  // double encoding is required for unshortened book urls to be redirected to properly

  return `${
    (provider?.method.links || []).find(link => link.rel === "authenticate")
      ?.href
  }&redirect_uri=${encodeURIComponent(encodeURIComponent(currentUrl))}`;
}

export const CleverButton: React.FC<AuthButtonProps<AuthMethod>> = ({
  provider
}) => {
  const { actions, dispatch } = useActions();

  const currentUrl = window.location.origin + window.location.pathname;

  const imageUrl = (provider?.method.links || []).find(
    link => link.rel === "logo"
  )?.href;

  const authUrl =
    provider && currentUrl ? getAuthUrl(provider, currentUrl) : null;

  return authUrl ? (
    <Button
      onClick={() => {
        dispatch(
          actions.saveAuthCredentials({
            provider: "Clever",
            credentials: ""
          })
        );
        window.location.href = authUrl;
      }}
      type="submit"
      sx={{
        ...modalButtonStyles,
        color: "#ffffff",
        backgroundColor: "#2f67aa",
        backgroundImage: `url(${imageUrl})`
      }}
      aria-label="Log In with Clever"
    >
      {!imageUrl ? "Log In With Clever" : ""}
    </Button>
  ) : null;
};

export default CleverButton;
