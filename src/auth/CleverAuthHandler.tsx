/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { OPDS1 } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import { useRouter } from "next/router";
import useUser from "components/context/UserContext";
import { clientOnly } from "components/ClientOnly";

const CleverAuthHandler: React.FC<{ method: OPDS1.CleverAuthMethod }> = ({
  method
}) => {
  // if (typeof window === "undefined") return null;
  const { push } = useRouter();
  const { token } = useUser();

  const currentUrl = window.location.origin + window.location.pathname;

  const authenticateHref = method.links?.find(
    link => link.rel === "authenticate"
  )?.href;
  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = authenticateHref
    ? `${authenticateHref}&redirect_uri=${encodeURIComponent(
        encodeURIComponent(currentUrl)
      )}`
    : undefined;

  // redirect to the auth url
  React.useEffect(() => {
    if (!token && authUrl) {
      push(authUrl);
    }
  }, [token, authUrl, push]);

  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      <LoadingIndicator />
      Logging in with Clever...
    </Stack>
  );
};

export default clientOnly(CleverAuthHandler);
