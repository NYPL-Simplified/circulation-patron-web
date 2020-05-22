import * as React from "react";
import { render } from "../../test-utils";
import Error from "../Error";

test("renders error message with 404 status code if status code not provided", () => {
  const node = render(<Error />);
  expect(
    node.getByText("Error: This page could not be found")
  ).toBeInTheDocument();
  expect(node.getByText("A 404 error occurred on server")).toBeInTheDocument();
});

test("renders 404 error message when there is a 404 error", () => {
  const node = render(<Error statusCode={404} />);
  expect(
    node.getByText("Error: This page could not be found")
  ).toBeInTheDocument();
  expect(node.getByText("A 404 error occurred on server")).toBeInTheDocument();
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
