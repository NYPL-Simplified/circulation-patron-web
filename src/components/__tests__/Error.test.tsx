import * as React from "react";
import mockConfig from "test-utils/mockConfig";
import { render } from "../../test-utils";
import Error from "../Error";

mockConfig();

test("renders error info", () => {
  const error = {
    status: 404,
    title: "Page Not Found",
    detail: "The requested url is not available"
  };
  const utils = render(<Error info={error} />);
  expect(utils.getByText("404 Error: Page Not Found")).toBeInTheDocument();
  expect(
    utils.getByText("The requested url is not available")
  ).toBeInTheDocument();
});
