import * as React from "react";
import Button from "components/Button";
import { modalButtonStyles } from "components/Modal";
import { OPDS1 } from "interfaces";
import { setAuthCredentials } from "auth/credentials";
import useLibraryContext from "components/context/LibraryContext";

const CleverButton: React.FC<{ method: OPDS1.CleverAuthMethod }> = ({
  method
}) => {
  const currentUrl = window.location.origin + window.location.pathname;
  const { slug } = useLibraryContext();
  const imageUrl = method.links?.find(link => link.rel === "logo")?.href;
  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = `${
    method.links?.find(link => link.rel === "authenticate")?.href
  }&redirect_uri=${encodeURIComponent(encodeURIComponent(currentUrl))}`;

  function saveCredentials() {
    setAuthCredentials(slug, { token: "", methodType: method.type });
  }

  return authUrl ? (
    <a href={authUrl}>
      <Button
        onClick={saveCredentials}
        type="submit"
        sx={{
          ...modalButtonStyles,
          color: "#ffffff",
          backgroundColor: "#2f67aa",
          backgroundImage: `url(${imageUrl})`
        }}
        aria-label="Log In with Clever"
      >
        {!imageUrl ? "Log In With Clever" : ""}
      </Button>
    </a>
  ) : null;
};

export default CleverButton;
