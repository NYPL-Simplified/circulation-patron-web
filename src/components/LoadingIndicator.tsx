/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { Spinner } from "theme-ui";
import { H2 } from "./Text";

const LoadingIndicator: React.FC<React.ComponentProps<typeof Spinner>> = ({
  color = "ui.black",
  ...props
}) => {
  return <Spinner color={color} {...props} />;
};

export const PageLoader: React.FC = () => {
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flex: "1 0 auto"
      }}
    >
      <LoadingIndicator />
      <H2 sx={{ fontSize: 2 }}>Loading...</H2>
    </div>
  );
};

export default LoadingIndicator;
