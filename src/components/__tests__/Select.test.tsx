import * as React from "react";
import { render } from "../../test-utils";
import Select, { Label } from "../Select";

test("select matches snapshot", () => {
  expect(
    render(
      <Select>
        <option>op 1</option>
      </Select>
    ).container.firstChild
  ).toMatchSnapshot();
});

test("select label matches snapshot", () => {
  expect(render(<Label>hi from label</Label>).container.firstChild)
    .toMatchInlineSnapshot(`
      .emotion-0 {
        white-space: nowrap;
      }

      <label
        class="emotion-0"
      >
        hi from label
      </label>
    `);
});
