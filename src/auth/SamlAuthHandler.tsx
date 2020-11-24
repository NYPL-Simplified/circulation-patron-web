/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { ClientSamlMethod } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import { clientOnly } from "components/ClientOnly";

/**
 * The SAML Auth handler sends you off to an external website to complete
 * auth.
 */
const SamlAuthHandler: React.FC<{ method: ClientSamlMethod }> = ({
  method
}) => {
  const { token, signOut } = useUser();
  const { fullSuccessUrl } = useLoginRedirectUrl();

  const urlWithRedirect = `${method.href}&redirect_uri=${encodeURIComponent(
    fullSuccessUrl
  )}`;
  React.useEffect(() => {
    if (!token && urlWithRedirect) {
      window.location.href = urlWithRedirect;
    }
  }, [token, signOut, urlWithRedirect]);

  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      <LoadingIndicator />
      Logging in with {method.description}...
    </Stack>
  );
};

export default clientOnly(SamlAuthHandler);
