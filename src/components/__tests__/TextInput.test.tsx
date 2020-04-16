/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { render } from "../../test-utils";
import TextInput, { TextArea } from "../TextInput";

test("TextInput renders properly and passes styles through", () => {
  const node = render(<TextInput sx={{ color: "red" }} />);
  expect(node.container.firstChild).toMatchInlineSnapshot(`
    .emotion-0 {
      border-radius: 4px;
      border: 1px solid;
      border-color: var(--theme-ui-colors-primary,#0467a6);
      border-width: 2px;
      padding: 4px;
      font-size: 16px;
      color: red;
    }

    <input
      class="emotion-0"
      type="text"
    />
  `);
  expect(node.container.firstChild).toHaveStyle("color: red");
});

test("type textarea renders properly and passes styles throug", () => {
  const node = render(<TextArea sx={{ color: "maroon" }} />);
  expect(node.container.firstChild).toMatchInlineSnapshot(`
    .emotion-0 {
      border-radius: 4px;
      border: 1px solid;
      border-color: var(--theme-ui-colors-primary,#0467a6);
      border-width: 2px;
      padding: 4px;
      font-size: 16px;
      color: maroon;
    }

    <textarea
      class="emotion-0"
    />
  `);
  expect(node.container.firstChild).toHaveStyle("color: maroon");
});
