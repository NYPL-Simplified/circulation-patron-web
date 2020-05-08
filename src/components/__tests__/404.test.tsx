import * as React from "react";
import { render } from "../../test-utils";
import NoMatch from "../404";

test("renders  404 error message", () => {
  const node = render(<NoMatch />);
  expect(node.getByText("404: Page not found")).toBeInTheDocument();
});
