import * as React from "react";
import { render } from "../../test-utils";
import Error from "../Error";

test("renders error message without status code", () => {
  const node = render(<Error />);
  expect(node.getByText("An error occurred")).toBeInTheDocument();
});

test("renders error message with status code", () => {
  const node = render(<Error statusCode={400} />);
  expect(node.getByText("A 400 error occurred on server")).toBeInTheDocument();
});

test("renders error page with title", () => {
  const node = render(<Error title={"No active hold"} />);
  expect(node.getByText("Error: No active hold")).toBeInTheDocument();
});

test("renders error page with detail", () => {
  const node = render(
    <Error detail={"All licenses for this book are loaned out."} />
  );
  expect(
    node.getByText("All licenses for this book are loaned out.")
  ).toBeInTheDocument();
});

test("renders 'Return Home' link", () => {
  const node = render(<Error />);
  expect(node.getByText("Return Home")).toBeInTheDocument();
  expect((node.getByText("Return Home") as HTMLLinkElement).href).toBe(
    "http://test-domain.com/"
  );
});
