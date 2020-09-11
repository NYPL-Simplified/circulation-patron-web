import * as React from "react";
import { render, fixtures, waitFor } from "test-utils";
import merge from "deepmerge";
import userEvent from "@testing-library/user-event";
import SamlAuthForm from "auth/SamlAuthButton";

const authCallback = jest.fn();
const cancel = jest.fn();
const authState: AuthState = {
  showForm: true,
  callback: authCallback,
  cancel: cancel,
  credentials: {
    provider: "auth-provider",
    credentials: "auth-cred"
  },
  title: "auth-title",
  error: null,
  attemptedProvider: null,
  providers: [fixtures.samlAuthProvider]
};

test("displays button", () => {
  const utils = render(<SamlAuthForm provider={fixtures.samlAuthProvider} />, {
    initialState: merge<State>(fixtures.initialState, {
      auth: authState
    })
  });
  expect(
    utils.getByRole("button", { name: "Login with SAML IdP" })
  ).toBeInTheDocument();
  expect(utils.queryByLabelText("Pin")).not.toBeInTheDocument();
});

/**
 * mock window.open so we can test it gets called
 */
window.open = jest.fn();

test("redirects to idp", async () => {
  const utils = render(<SamlAuthForm provider={fixtures.samlAuthProvider} />, {
    initialState: merge<State>(fixtures.initialState, {
      auth: authState
    })
  });

  // act
  const loginButton = utils.getByRole("button", {
    name: "Login with SAML IdP"
  });
  userEvent.click(loginButton);

  // assert
  // we wrap this in waitFor because the handleSubmit from react-hook-form has
  // async code in it
  await waitFor(() => {
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      "/saml-auth-url&redirect_uri=http%3A%2F%2Ftest-domain.com%2F",
      "_self"
    );
  });
});
