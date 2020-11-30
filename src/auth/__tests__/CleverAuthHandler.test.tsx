import ApplicationError from "errors";
import * as React from "react";
import { fixtures, render, waitFor } from "test-utils";
import CleverAuthHandler from "../CleverAuthHandler";

// we import the unwrapped render here because we don't need the context providers

test("shows loader while redirecting", () => {
  const utils = render(
    <CleverAuthHandler method={fixtures.cleverAuthMethod} />
  );
  expect(utils.getByText("Logging in with Clever...")).toBeInTheDocument();
});

beforeEach(() => {
  // this will allow us to test that window.location changes
  const location = new URL("http://test-domain.com");
  delete (window as any).location;
  (window as any).location = location;
});

test("redirects to proper auth url", async () => {
  render(<CleverAuthHandler method={fixtures.cleverAuthMethod} />, {
    user: { token: undefined }
  });
  await waitFor(() => {
    expect(window.location.href).toBe(
      "https://example.com/oauth_authenticate?provider=Clever&redirect_uri=http%253A%252F%252Ftest-domain.com%252Ftestlib"
    );
  });
});

test("does not redirect if there is a token present", () => {
  render(<CleverAuthHandler method={fixtures.cleverAuthMethod} />, {
    user: { token: "something" }
  });
  expect(window.location.href).toBe("http://test-domain.com/");
});

test("throws error if there is no authenticate link in library data", () => {
  expect(() =>
    render(
      <CleverAuthHandler method={{ ...fixtures.cleverAuthMethod, links: [] }} />
    )
  ).toThrowError(ApplicationError);
});
