import * as React from "react";
import { render } from "../../test-utils";
import { OpenEbooksLandingComponent } from "components/OpenEbooksLanding";

test("renders", () => {
  const utils = render(<OpenEbooksLandingComponent />);
  expect(
    utils.getByRole("heading", {
      name: "Lorem Ipsum Secondary Headline Welcome Openebooks"
    })
  ).toBeInTheDocument();
});
