import * as React from "react";
import { render, fixtures, waitFor } from "test-utils";
import userEvent from "@testing-library/user-event";
import SamlAuthButton from "auth/SamlAuthButton";

test("displays button", () => {
  const utils = render(
    <SamlAuthButton method={fixtures.createSamlMethod(0)} />
  );
  expect(
    utils.getByRole("button", { name: "Login with SAML IdP 0" })
  ).toBeInTheDocument();
  expect(utils.queryByLabelText("Pin")).not.toBeInTheDocument();
});

/**
 * mock window.open so we can test it gets called
 */
window.open = jest.fn();

test("redirects to idp", async () => {
  const utils = render(
    <SamlAuthButton method={fixtures.createSamlMethod(0)} />
  );

  // act
  const loginButton = utils.getByRole("button", {
    name: "Login with SAML IdP 0"
  });
  userEvent.click(loginButton);

  // assert
  // we wrap this in waitFor because the handleSubmit from react-hook-form has
  // async code in it
  await waitFor(() => {
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      "/saml-auth-url/0&redirect_uri=http%3A%2F%2Ftest-domain.com%2F",
      "_self"
    );
  });
});
