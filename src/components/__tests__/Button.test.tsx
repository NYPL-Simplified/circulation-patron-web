import * as React from "react";
import { render } from "../../test-utils";
import Button, { NavButton, AnchorButton } from "../Button";

describe("variants", () => {
  test("filled (default)", () => {
    const utils = render(<Button>child</Button>);
    const button = utils.getByText("child");
    expect(button).toMatchSnapshot();
  });
  test("ghost", () => {
    const utils = render(<Button variant="ghost">child</Button>);
    const button = utils.getByText("child");
    expect(button).toMatchSnapshot();
  });
  test("link", () => {
    const utils = render(<Button variant="link">child</Button>);
    const button = utils.getByText("child");
    expect(button).toMatchSnapshot();
  });
});
test("NavButton renders correct element", () => {
  const utils = render(<NavButton href="/somewhere">child</NavButton>);
  const button = utils.getByText("child");
  expect(button).toHaveAttribute("href", "/testlib/somewhere");
  expect(button).toMatchSnapshot();
});
test("LinkButton renders correct element", () => {
  const utils = render(
    <AnchorButton href="http://some.com/external">child</AnchorButton>
  );
  const button = utils.getByText("child");
  expect(button).toHaveAttribute("href", "http://some.com/external");
  expect(button).toMatchSnapshot();
});
