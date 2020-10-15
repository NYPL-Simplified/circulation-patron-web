/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import FormLabel from "./FormLabel";
import TextInput from "../TextInput";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
};
/**
 * An input component to be used in a form that supports errors,
 * labels and uses the base TextInput component
 */
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ type = "text", label, name, error, required, ...props }, ref) => {
    const describedById = `${name}-errors`;
    return (
      <div role="group" sx={{ mb: 2 }}>
        <FormLabel sx={{ mb: 1, display: "inline-block" }} htmlFor={name}>
          {label}
          {required && <span sx={{ color: "ui.error" }}>*</span>}
        </FormLabel>
        <TextInput
          id={name}
          name={name}
          aria-label={`${name} input`}
          aria-describedby={describedById}
          ref={ref}
          type={type}
          sx={{
            display: "block",
            borderColor: error ? "ui.error" : undefined
          }}
          {...props}
        />
        {error && (
          <span
            id={describedById}
            sx={{ color: "ui.error", fontStyle: "italic" }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

export default FormInput;
