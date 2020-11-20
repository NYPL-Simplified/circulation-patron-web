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
const SamlAuthHandler: React.FC<{ method: ClientSamlMethod }> = ({
  method
}) => {
  const handleClick = async () => {
    // get the current location to be redirected back to
    const referrer = encodeURIComponent(window.location.href);
    const urlWithReferrer = `${method.href}&redirect_uri=${referrer}`;
    window.open(urlWithReferrer, "_self");
  };
  return <div>Logging in with Saml</div>;
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

export default SamlAuthHandler;
