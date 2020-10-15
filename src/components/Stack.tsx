/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

type StackProps = {
  direction?: "row" | "column";
  spacing?: number | string;
  className?: string;
};
const Stack: React.FC<StackProps> = ({
  direction = "row",
  spacing = 2,
  children,
  className,
  ...rest
}) => {
  return (
    <div
      className={className}
      sx={{
        display: "flex",
        flexDirection: direction,
        "&>*": {
          mr: direction === "row" ? spacing : undefined,
          mb: direction === "column" ? spacing : undefined
        },
        "&>*:last-child": {
          mr: direction === "row" ? 0 : undefined,
          mb: direction === "column" ? 0 : undefined
        }
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Stack;
