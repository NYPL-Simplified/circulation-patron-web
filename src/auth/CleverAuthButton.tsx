/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { AnchorButton } from "components/Button";
import { OPDS1 } from "interfaces";
import { authButtonstyles } from "./AuthButton";

const CleverButton: React.FC<{
  className?: string;
  method: OPDS1.CleverAuthMethod;
}> = ({ className, method }) => {
  if (typeof window === "undefined") return null;
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
      className={className}
      sx={{
        ...authButtonstyles,
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
