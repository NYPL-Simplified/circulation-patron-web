import * as React from "react";
import { render, actions } from "../../test-utils";
import SignOut from "components/SignOut";
import userEvent from "@testing-library/user-event";

test("Shows button", () => {
  const utils = render(<SignOut />);
  expect(utils.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
});

test("Modal is initially hidden", () => {
  const utils = render(<SignOut />);
  const modal = utils.getByLabelText("Sign Out");
  expect(modal).toHaveStyle("display: none");
  expect(modal).not.toBeVisible();
});

test("Shows modal on click", async () => {
  const utils = render(<SignOut />);
  const signOut = utils.getByRole("button", { name: "Sign Out" });
  userEvent.click(signOut);

  const modal = utils.getByLabelText("Sign Out");

  expect(modal).toHaveStyle("display: block");
  expect(modal).toBeVisible();

  expect(utils.getByText("Are you sure you want to sign out?")).toBeVisible();
});

test("hides dialog on cancel", () => {
  const utils = render(<SignOut />);
  const signOut = utils.getByRole("button", { name: "Sign Out" });
  // show
  userEvent.click(signOut);
  expect(utils.getByLabelText("Sign Out")).toBeVisible();

  const cancel = utils.getByRole("button", { name: "Cancel" });

  userEvent.click(cancel);
  expect(utils.getByLabelText("Sign Out")).not.toBeVisible();
});

test("signs out on click signout", () => {
  const clearAuthMock = jest.spyOn(actions, "clearAuthCredentials");
  const utils = render(<SignOut />);
  const signOut = utils.getByRole("button", { name: "Sign Out" });

  userEvent.click(signOut);
  const signOutForReal = utils.getByRole("button", {
    name: "Confirm Sign Out"
  });

  expect(clearAuthMock).toHaveBeenCalledTimes(0);
  userEvent.click(signOutForReal);
  expect(clearAuthMock).toHaveBeenCalledTimes(1);
});
