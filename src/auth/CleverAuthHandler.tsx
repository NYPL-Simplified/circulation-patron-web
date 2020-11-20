/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { OPDS1 } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import { useRouter } from "next/router";
import useUser from "components/context/UserContext";
import { clientOnly } from "components/ClientOnly";
import extractParam from "dataflow/utils";
import useLinkUtils from "hooks/useLinkUtils";

const CleverAuthHandler: React.FC<{ method: OPDS1.CleverAuthMethod }> = ({
  method
}) => {
  const { push, query } = useRouter();
  const { token } = useUser();
  const { buildMultiLibraryLink } = useLinkUtils();

  const catalogRootUrl = buildMultiLibraryLink("/");
  const nextUrl = extractParam(query, "nextUrl");
  const redirectUrl = `${window.location.origin}${nextUrl ?? catalogRootUrl}`;

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
