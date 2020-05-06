import * as React from "react";
import { render } from "../../test-utils";
import Error from "../_error";

test("renders error page without status code", () => {
  const node = render(<Error />);
  expect(node.getByText("An error occurred")).toBeInTheDocument();
  expect(node.getByText("Return Home")).toBeInTheDocument();
});

test("renders error page with status code", () => {
  const node = render(<Error statusCode={400} />);
  expect(node.getByText("An error 400 occurred on server")).toBeInTheDocument();
  expect(node.getByText("Return Home")).toBeInTheDocument();
});

test("renders 'Return Home' link", () => {
  const node = render(<Error />);
  expect(node.getByText("Return Home")).toBeInTheDocument();
  expect((node.getByText("Return Home") as HTMLLinkElement).href).toBe(
    "http://test-domain.com/"
  );
});
