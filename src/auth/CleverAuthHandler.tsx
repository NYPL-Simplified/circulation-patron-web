/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { OPDS1 } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import { clientOnly } from "components/ClientOnly";
import useLoginRedirectUrl from "auth/useLoginRedirect";

const CleverAuthHandler: React.FC<{ method: OPDS1.CleverAuthMethod }> = ({
  method
}) => {
  const { token } = useUser();
  const redirectUrl = useLoginRedirectUrl();

  const authenticateHref = method.links?.find(
    link => link.rel === "authenticate"
  )?.href;

  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = authenticateHref
    ? `${authenticateHref}&redirect_uri=${encodeURIComponent(
        encodeURIComponent(redirectUrl)
      )}`
    : undefined;

  // redirect to the auth url
  React.useEffect(() => {
    if (!token && authUrl) {
      window.location.href = authUrl;
    }
  }, [token, authUrl]);

  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      <LoadingIndicator />
      Logging in with Clever...
    </Stack>
  );
};

export default clientOnly(CleverAuthHandler);
