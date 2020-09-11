/** @jsx jsx */
import { jsx } from "theme-ui";
import Button from "components/Button";
import { modalButtonStyles } from "components/Modal";
import { OPDS1 } from "interfaces";

const BasicAuthButton: React.FC<{
  method: OPDS1.BasicAuthMethod;
  onClick: (type: string) => void;
}> = ({ method, onClick }) => {
  const { description, links } = method;
  const imageUrl = links?.find(link => link.rel === "logo")?.href;

  return (
    <Button
      aria-label={`Login to ${description}`}
      type="submit"
      onClick={() => onClick(method.type)}
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
