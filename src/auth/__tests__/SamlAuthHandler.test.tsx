import * as React from "react";
import { fixtures, render, waitFor } from "test-utils";
import SamlAuthHandler from "../SamlAuthHandler";

// we import the unwrapped render here because we don't need the context providers

test("shows loader while redirecting", () => {
  const utils = render(<SamlAuthHandler method={fixtures.clientSamlMethod} />);
  expect(utils.getByText("Logging in with SAML IdP 0...")).toBeInTheDocument();
});

beforeEach(() => {
  // this will allow us to test that window.location changes
  const location = new URL("http://test-domain.com");
  delete (window as any).location;
  (window as any).location = location;
});

test("redirects to proper auth url", async () => {
  render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });
  await waitFor(() => {
    expect(window.location.href).toBe(
      "https://saml-auth.com/0&redirect_uri=http%3A%2F%2Ftest-domain.com%2Ftestlib"
    );
  });
});

test("does not redirect if there is a token", async () => {
  render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: {
      token: "some-token"
    }
  });
  expect(window.location.href).toBe("http://test-domain.com/");
});
