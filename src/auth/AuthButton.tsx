/** @jsx jsx */
import { jsx } from "theme-ui";
import Button from "components/Button";
import { modalButtonStyles } from "components/Modal";
import { OPDS1 } from "interfaces";
import { AuthButtonProps } from "auth/authPlugins";

const BasicAuthButton: React.FC<AuthButtonProps<OPDS1.BasicAuthMethod>> = ({
  method,
  onClick
}) => {
  const { description, links } = method;
  const imageUrl = links?.find(link => link.rel === "logo")?.href;

  return (
    <Button
      aria-label={`Login to ${description}`}
      type="submit"
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
