/** @jsx jsx */
import { jsx } from "theme-ui";
import Button from "components/Button";

const BasicAuthButton = props => {
  const imageUrl = props.links.find(link => link.rel === "logo")?.href;

  return (
    <Button
      type="submit"
      sx={{
        alignSelf: "flex-end",
        m: 2,
        mr: 0,
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
      {...props}
    >
      {!imageUrl ? "Login" : ""}
    </Button>
  );
};

export default BasicAuthButton;
