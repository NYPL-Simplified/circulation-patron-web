import * as React from "react";
import { render } from "test-utils";
import CleverButton from "../CleverButton";

describe("CleverButton", () => {
  test("constructs proper authUrl", () => {
    const utils = render(<CleverButton method={fixtures.cleverAuthMethod} />);
    const button = utils.getByLabelText("Log In with Clever");
    expect(button).toHaveAttribute(
      "href",
      "https://example.com/oauth_authenticate?provider=Clever&redirect_uri=http%253A%252F%252Ftest-domain.com%252F"
    );
  });

  test("returns button labeled Log In With Clever", () => {
    const utils = render(<CleverButton method={fixtures.cleverAuthMethod} />);
    const button = utils.getByLabelText("Log In with Clever");
    expect(button).toBeInTheDocument();
    expect(button).toBeEmptyDOMElement();
  });

  test("has text content when no image url supplied", () => {
    const utils = render(
      <CleverButton
        method={{
          ...fixtures.cleverAuthMethod,
          links: [{ href: "/authenticate", rel: "authenticate" }]
        }}
      />
    );
    const button = utils.getByLabelText("Log In with Clever");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Log In With Clever");
  });

  test("returns null when there is no authenticate link in method", () => {
    const { container } = render(
      <CleverButton method={{ ...fixtures.cleverAuthMethod, links: [] }} />
    );
    expect(container.firstChild).toBeNull();
  });
});
