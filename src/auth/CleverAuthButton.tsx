import * as React from "react";
import { AnchorButton } from "components/Button";
import { modalButtonStyles } from "components/Modal";
import { OPDS1 } from "interfaces";

const CleverButton: React.FC<{ method: OPDS1.CleverAuthMethod }> = ({
  method
}) => {
  const currentUrl = window.location.origin + window.location.pathname;
  const imageUrl = method.links?.find(link => link.rel === "logo")?.href;

  const authenticateHref = method.links?.find(
    link => link.rel === "authenticate"
  )?.href;
  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = authenticateHref
    ? `${authenticateHref}&redirect_uri=${encodeURIComponent(
        encodeURIComponent(currentUrl)
      )}`
    : undefined;

  return authUrl ? (
    <AnchorButton
      href={authUrl}
      type="submit"
      sx={{
        ...modalButtonStyles,
        color: "#ffffff",
        backgroundColor: "#2f67aa"
      }}
      aria-label="Log In with Clever"
    >
      {!imageUrl ? (
        "Log In With Clever"
      ) : (
        <img alt="Clever Logo" src={imageUrl} />
      )}
    </AnchorButton>
  ) : null;
};

export default CleverButton;
