/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "components/Button";
import { ClientSamlMethod } from "opds-web-client/lib/interfaces";
import { AuthFormProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";
import { modalButtonStyles } from "../components/Modal";
/**
 * Auth form
 */
const SamlAuthForm: React.FC<AuthFormProps<ClientSamlMethod>> = ({
  provider
}) => {
  const handleClick = async () => {
    // get the current location to be redirected back to
    const referrer = encodeURIComponent(window.location.href);
    const urlWithReferrer = `${provider.method.href}&redirect_uri=${referrer}`;
    window.open(urlWithReferrer, "_self");
  };
  return (
    <Button sx={{ ...modalButtonStyles }} onClick={handleClick}>
      Login with {provider.method.description ?? "Unknown IDP"}
    </Button>
  );
};

export default SamlAuthForm;
