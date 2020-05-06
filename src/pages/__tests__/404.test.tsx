import * as React from "react";
import { render } from "../../test-utils";
import Custom404 from "../404";

test("renders  404 error message", () => {
  const node = render(<Custom404 />);
  expect(node.getByText("404: Page Not Found")).toBeInTheDocument();
});

test("renders 'Return Home' link", () => {
  const node = render(<Custom404 />);
  expect(node.getByText("Return Home")).toBeInTheDocument();
  expect((node.getByText("Return Home") as HTMLLinkElement).href).toBe(
    "http://test-domain.com/"
  );
});
