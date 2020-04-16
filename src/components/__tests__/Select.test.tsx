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
  ).toMatchInlineSnapshot(`
    .emotion-0 {
      width: 100%;
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-align-items: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      position: relative;
      padding-left: 4px;
      padding-right: 8px;
      height: 2rem;
      font-size: 16px;
      line-height: normal;
      background-color: white;
      padding-bottom: 4px;
      -webkit-transition: all 0.2s ease 0s;
      transition: all 0.2s ease 0s;
      border-radius: 4px;
      border: 1px solid;
      border-color: var(--theme-ui-colors-primary,#0467a6);
    }

    <select
      class="emotion-0"
    >
      <option>
        op 1
      </option>
    </select>
  `);
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
