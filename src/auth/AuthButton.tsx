/** @jsx jsx */
import { jsx } from "theme-ui";
import Button from "components/Button";

const BasicAuthButton = ({ provider, onClick }) => {
  const { id, method } = provider;
  const { description, links } = method;
  const imageUrl = links.find(link => link.rel === "logo")?.href;

  return (
    <Button
      aria-label={`Login to ${description}`}
      type="submit"
      value={id}
      onClick={onClick}
      sx={{
        m: 2,
        flex: "1 0 auto",
        width: "280px",
        height: "51px",
        backgroundSize: `280px 51px`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0",
        backgroundImage: `url(${imageUrl})`,
        cursor: "pointer",
        border: "none"
      }}
    >
      {!imageUrl ? "Login" : ""}
    </Button>
  );
};

export default BasicAuthButton;
