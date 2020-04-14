import * as React from "react";
import { render } from "../../test-utils";
import Button, { NavButton, AnchorButton } from "../Button";
import userEvent from "@testing-library/user-event";

describe("variants", () => {
  test("primary (default)", () => {
    const node = render(<Button>child</Button>);
    const button = node.getByText("child");
    expect(button).toMatchSnapshot();
  });

  test("flat", () => {
    const node = render(<Button variant="flat">child</Button>);
    const button = node.getByText("child");
    expect(button).toMatchSnapshot();
  });
  test("accent", () => {
    const node = render(<Button variant="accent">child</Button>);
    const button = node.getByText("child");
    expect(button).toMatchSnapshot();
  });
});
test("disabled style", () => {
  const node = render(<Button disabled>child</Button>);
  const button = node.getByText("child");
  expect(button).toBeDisabled();
  expect(button).toMatchSnapshot();
});
test("NavButton renders correct element", () => {
  const node = render(<NavButton to="/somewhere">child</NavButton>);
  const button = node.getByText("child");
  expect(button).toHaveAttribute("href", "/somewhere");
  expect(button).toMatchSnapshot();
  // make sure clicking it actually tries to route you home
  userEvent.click(button);
  expect(node.history.location.pathname).toBe("/somewhere");
});
test("LinkButton renders correct element", () => {
  const node = render(
    <AnchorButton href="http://some.com/external">child</AnchorButton>
  );
  const button = node.getByText("child");
  expect(button).toHaveAttribute("href", "http://some.com/external");
  expect(button).toMatchSnapshot();
});
