/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
/**
 * A base component that can be easily customized within
 * the CPW design system
 */

const styles = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "primary",
  borderWidth: 2,
  p: 1,
  fontSize: 2
};

const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ type = "text", ...props }, ref) => {
  return <input ref={ref} type={type} sx={styles} {...props} />;
});

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.InputHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => {
  return <textarea ref={ref} sx={styles} {...props} />;
});

export default TextInput;
