import * as React from "react";
import { render } from "../../test-utils";
import FormInput from "../form/FormInput";

test("renders as expected", () => {
  const utils = render(<FormInput name="input-name" label="Email" />);
  expect(utils.container.firstChild).toMatchSnapshot();
});

test("displays star when required", () => {
  const utils = render(<FormInput required name="input-name" label="Email" />);
  expect(utils.getByText("*")).toBeInTheDocument();
});

test("no star when not required", () => {
  const utils = render(<FormInput name="input-name" label="Email" />);
  expect(utils.queryByText("*")).toBeNull();
});

test("displays label", () => {
  const utils = render(<FormInput name="input-name" label="Email" />);
  expect(utils.getByText("Email")).toBeInTheDocument();
});

test("shows error when present", () => {
  const utils = render(
    <FormInput name="input-name" label="Email" error="Something went wrong" />
  );
  expect(utils.getByText("Something went wrong")).toBeInTheDocument();
});
