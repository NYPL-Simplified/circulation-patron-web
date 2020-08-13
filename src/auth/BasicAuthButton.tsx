/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "components/Button";

const BasicAuthButton = props => {
  let imageUrl;

  for (const link of props.links || []) {
    if (link.rel === "logo") {
      imageUrl = link.href;
      break;
    }
  }

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
