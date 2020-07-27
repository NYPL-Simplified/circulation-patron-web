/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "components/Button";
import useTypedSelector from "hooks/useTypedSelector";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { ClientSamlMethod } from "opds-web-client/lib/interfaces";
import { AuthFormProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

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

    // // call the callback that was saved when the form was triggered
    // callback?.();
  };
  return (
    <div
      sx={{
        p: 2,
        pt: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Button onClick={handleClick}>
        Login with {provider.method.description ?? "Unknown IDP"}
      </Button>
    </div>
  );
};

export default SamlAuthForm;
