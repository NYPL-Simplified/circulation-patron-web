/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { render } from "../../test-utils";
import TextInput, { TextArea } from "../TextInput";

test("TextInput renders properly and passes styles through", () => {
  const utils = render(<TextInput sx={{ color: "red" }} />);
  expect(utils.container.firstChild).toMatchSnapshot();

  expect(utils.container.firstChild).toHaveStyle("color: red");
});

test("type textarea renders properly and passes styles throug", () => {
  const utils = render(<TextArea sx={{ color: "maroon" }} />);
  expect(utils.container.firstChild).toMatchSnapshot();
  expect(utils.container.firstChild).toHaveStyle("color: maroon");
});
