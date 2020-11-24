/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "components/Button";
import { ClientSamlMethod } from "interfaces";
import { authButtonstyles } from "./AuthButton";

/**
 * The SAML Auth button sends you off to an external website to complete
 * auth.
 */
const SamlAuthButton: React.FC<{
  className?: string;
  method: ClientSamlMethod;
}> = ({ className, method }) => {
  const handleClick = async () => {
    // get the current location to be redirected back to
    const referrer = encodeURIComponent(window.location.href);
    const urlWithReferrer = `${method.href}&redirect_uri=${referrer}`;
    window.open(urlWithReferrer, "_self");
  };
  return (
    <Button
      className={className}
      sx={{ ...authButtonstyles }}
      onClick={handleClick}
    >
      Login with {method.description ?? "Unknown IDP"}
    </Button>
  );
};

export default SamlAuthButton;
