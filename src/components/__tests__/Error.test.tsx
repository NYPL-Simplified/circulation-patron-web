import * as React from "react";
import mockConfig from "test-utils/mockConfig";
import { render } from "../../test-utils";
import Error from "../Error";

mockConfig();

test("renders error message with 404 status code if status code not provided", () => {
  const utils = render(<Error />);
  expect(
    utils.getByText("404 Error: This page could not be found")
  ).toBeInTheDocument();
});

test("renders 404 error message when there is a 404 error", () => {
  const utils = render(<Error statusCode={404} />);
  expect(
    utils.getByText("404 Error: This page could not be found")
  ).toBeInTheDocument();
});

test("renders error message with status code", () => {
  const utils = render(<Error statusCode={400} />);
  expect(utils.getByText("400 Error: Bad Request")).toBeInTheDocument();
});

test("renders error page with title", () => {
  const utils = render(<Error statusCode={400} title={"No active hold"} />);
  expect(utils.getByText("400 Error: No active hold")).toBeInTheDocument();
});

test("renders error page with detail", () => {
  const utils = render(
    <Error detail={"All licenses for this book are loaned out."} />
  );
  expect(
    utils.getByText("All licenses for this book are loaned out.")
  ).toBeInTheDocument();
});
