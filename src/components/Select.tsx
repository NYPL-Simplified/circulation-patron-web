/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import SvgExpandMore from "icons/ExpandMore";

type SelectProps = React.ComponentProps<"select">;
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, ...props }, ref) => {
    return (
      <div sx={{ position: "relative" }}>
        <select
          ref={ref}
          sx={{
            appearance: "none",
            width: "100%",
            pl: 2,
            pr: "2rem",
            py: 1,
            border: "solid",
            borderRadius: 1,
            variant: "text.body.regular",
            fontSize: "-1"
          }}
          {...props}
        >
          {children}
        </select>
        <SvgExpandMore
          sx={{
            position: "absolute",
            height: "100%",
            width: "1.75rem",
            right: "0.25rem",
            pointerEvents: "none"
          }}
        />
      </div>
    );
  }
);

export const Label: React.FC<React.ComponentProps<"label">> = ({
  children,
  ...props
}) => {
  return (
    <label sx={{ whiteSpace: "nowrap" }} {...props}>
      {children}
    </label>
  );
};

export default Select;
