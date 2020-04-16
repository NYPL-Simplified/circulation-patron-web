import * as React from "react";
import { render } from "../../test-utils";
import FormInput from "../form/FormInput";

test("renders as expected", () => {
  const node = render(<FormInput name="input-name" label="Email" />);
  expect(node.container.firstChild).toMatchSnapshot();
});

test("displays star when required", () => {
  const node = render(<FormInput required name="input-name" label="Email" />);
  expect(node.getByText("*")).toBeInTheDocument();
});

test("no star when not required", () => {
  const node = render(<FormInput name="input-name" label="Email" />);
  expect(node.queryByText("*")).toBeNull();
});

test("displays label", () => {
  const node = render(<FormInput name="input-name" label="Email" />);
  expect(node.getByText("Email")).toBeInTheDocument();
});

test("shows error when present", () => {
  const node = render(
    <FormInput name="input-name" label="Email" error="Something went wrong" />
  );
  expect(node.getByText("Something went wrong")).toBeInTheDocument();
});
