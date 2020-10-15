/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

type HTMLLabelProps = React.HTMLProps<HTMLLabelElement>;
type FormLabelProps = HTMLLabelProps & {
  htmlFor: string;
};
/**
 * A simple form label with styling and
 * can have errors as well.
 */
const FormLabel: React.FC<FormLabelProps> = ({ children, ...rest }) => {
  return (
    <label sx={{ fontSize: "-1", fontWeight: "medium", mr: 2 }} {...rest}>
      {children}
    </label>
  );
};

export default FormLabel;
