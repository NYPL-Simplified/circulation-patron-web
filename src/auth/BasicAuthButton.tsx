/** @jsx jsx */
import { jsx } from "theme-ui";
import Button from "components/Button";
import { OPDS1 } from "interfaces";
import { authButtonstyles } from "./AuthButton";

const BasicAuthButton: React.FC<{
  className?: string;
  method: OPDS1.BasicAuthMethod;
  onClick: (type: string) => void;
}> = ({ className, method, onClick }) => {
  const { description, links } = method;
  const imageUrl = links?.find(link => link.rel === "logo")?.href;
  const name = description ?? "Basic Auth";

  return (
    <Button
      className={className}
      aria-label={`Login with ${name}`}
      type="submit"
      onClick={() => onClick(method.type)}
      sx={{
        ...authButtonstyles,
        backgroundImage: `url(${imageUrl})`
      }}
    >
      {imageUrl ? "" : `Login with ${name}`}
    </Button>
  );
};

export default BasicAuthButton;
