/** @jsx jsx */
import { jsx } from "theme-ui";
import Button from "components/Button";
import { AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

import { modalButtonStyles } from "../components/Modal";

const BasicAuthButton: React.FC<AuthButtonProps<AuthMethod>> = ({
  provider,
  onClick
}) => {
  if (!provider?.id || !provider?.method) {
    return null;
  }
  const { id, method } = provider;
  const { description, links } = method;
  const imageUrl = links?.find(link => link.rel === "logo")?.href;

  return (
    <Button
      aria-label={`Login to ${description}`}
      type="submit"
      value={id}
      onClick={onClick}
      sx={{
        ...modalButtonStyles,
        backgroundImage: `url(${imageUrl})`
      }}
    >
      {!imageUrl ? "Login" : ""}
    </Button>
  );
};

export default BasicAuthButton;
