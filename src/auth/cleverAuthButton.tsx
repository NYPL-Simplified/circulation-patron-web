import * as React from "react";
import { AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import Button from "components/Button";

const CleverButton: React.FC<AuthButtonProps<AuthMethod>> = ({ provider }) => {
  const { actions, dispatch } = useActions();

  const currentUrl = window.location.origin + window.location.pathname;
  let authUrl;
  let imageUrl;

  for (const link of provider?.method.links || []) {
    if (link.rel === "logo") {
      imageUrl = link.href;
    }
    if (link.rel === "authenticate") {
      authUrl =
        link.href +
        "&redirect_uri=" +
        // double encoding is required for unshortened book urls to be redirected to properly
        encodeURIComponent(encodeURIComponent(currentUrl));
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
          color: "#ffffff",
          backgroundColor: "#2f67aa",
          width: "280px",
          height: "51px",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0",
          backgroundImage: `url(${imageUrl})`,
          cursor: "pointer",
          border: "none"
        }}
        aria-label="Log In with Clever"
      >
        {!imageUrl ? "Log In With Clever" : ""}
      </Button>
    </a>
  ) : null;
};

export default CleverButton;
