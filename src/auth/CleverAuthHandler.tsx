/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { OPDS1 } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import { clientOnly } from "components/ClientOnly";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import ApplicationError from "errors";

const CleverAuthHandler: React.FC<{ method: OPDS1.CleverAuthMethod }> = ({
  method
}) => {
  const { token } = useUser();
  const { fullSuccessUrl } = useLoginRedirectUrl();

  const authenticateHref = method.links?.find(
    link => link.rel === "authenticate"
  )?.href;

  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = authenticateHref
    ? `${authenticateHref}&redirect_uri=${encodeURIComponent(
        encodeURIComponent(fullSuccessUrl)
      )}`
    : undefined;

  // redirect to the auth url
  React.useEffect(() => {
    if (!authUrl) {
      throw new ApplicationError({
        title: "Incomplete Library Data",
        detail:
          "The required link with rel 'authenticate' is missing from library data."
      });
    }
    if (!token) {
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
