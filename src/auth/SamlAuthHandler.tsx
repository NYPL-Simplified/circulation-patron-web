/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { ClientSamlMethod } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import useLoginRedirectUrl from "auth/useLoginRedirect";

/**
 * The SAML Auth button sends you off to an external website to complete
 * auth.
 */
const SamlAuthHandler: React.FC<{ method: ClientSamlMethod }> = ({
  method
}) => {
  const { token } = useUser();
  const redirectUrl = useLoginRedirectUrl();

  const urlWithRedirect = `${method.href}&redirect_uri=${encodeURIComponent(
    redirectUrl
  )}`;
  React.useEffect(() => {
    if (!token && urlWithRedirect) {
      window.location.href = urlWithRedirect;
    }
  }, [token, urlWithRedirect]);

  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      <LoadingIndicator />
      Logging in with {method.description}
    </Stack>
  );
};

export default SamlAuthHandler;
