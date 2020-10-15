/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "components/Button";
import { modalButtonStyles } from "../components/Modal";
import { ClientSamlMethod } from "interfaces";

/**
 * The SAML Auth button sends you off to an external website to complete
 * auth.
 */
const SamlAuthButton: React.FC<{ method: ClientSamlMethod }> = ({ method }) => {
  const handleClick = async () => {
    // get the current location to be redirected back to
    const referrer = encodeURIComponent(window.location.href);
    const urlWithReferrer = `${method.href}&redirect_uri=${referrer}`;
    window.open(urlWithReferrer, "_self");
  };
  return (
    <Button sx={{ ...modalButtonStyles }} onClick={handleClick}>
      Login with {method.description ?? "Unknown IDP"}
    </Button>
  );
};

export default SamlAuthButton;
