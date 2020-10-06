import { AppAuthMethod, OPDS1 } from "interfaces";
import * as React from "react";
import { render, fixtures } from "test-utils";
import * as dialog from "reakit/Dialog";
import userEvent from "@testing-library/user-event";
import * as user from "components/context/UserContext";
import mockUser from "test-utils/mockUser";

const useUserSpy = jest.spyOn(user, "default");

const useDialogSpy = jest.spyOn(dialog, "useDialogState");
const mockHide = jest.fn();
useDialogSpy.mockReturnValue({
  visible: true,
  baseId: "id",
  animated: false,
  modal: true,
  hide: mockHide
} as any);

/**
 * We don't have to directly render the auth form because it is already
 * rendered in the ContextProvider, which our custom `render`
 * already wraps everything with.
 */

test("renders header and subheader", () => {
  const utils = render(<div>child</div>);
  expect(utils.getByText("Login")).toBeInTheDocument();
  expect(utils.getByText("XYZ Public Library")).toBeInTheDocument();
});

test("shows warning if there is no auth method configured", async () => {
  const utils = render(<div>child</div>, {
    library: {
      ...fixtures.libraryData,
      libraryLinks: {
        helpEmail: { href: "mailto:help@gmail.com" }
      },
      authMethods: []
    }
  });
  expect(
    utils.getByText("This Library does not have any authentication configured.")
  );
  expect(utils.getByLabelText("Send email to help desk")).toHaveAttribute(
    "href",
    "mailto:help@gmail.com"
  );
});

const oneAuthMethod: AppAuthMethod[] = [fixtures.basicAuthMethod];

test("shows form when only one auth method configured", () => {
  const utils = render(<div>child</div>, {
    library: {
      ...fixtures.libraryData,
      authMethods: oneAuthMethod
    }
  });

  expect(
    utils.getByRole("textbox", { name: "Barcode input" })
  ).toBeInTheDocument();
});

const fourAuthMethods: AppAuthMethod[] = [
  fixtures.basicAuthMethod,
  fixtures.cleverAuthMethod,
  fixtures.createSamlMethod(0),
  fixtures.createSamlMethod(1)
];
test("shows buttons with four auth methods configured", async () => {
  const utils = render(<div>child</div>, {
    library: {
      ...fixtures.libraryData,
      authMethods: fourAuthMethods
    }
  });

  expect(
    utils.getByLabelText("Available authentication methods")
  ).toBeInTheDocument();
  const basicAuthButton = utils.getByRole("button", {
    name: "Login with Library Barcode"
  });
  expect(basicAuthButton).toBeInTheDocument();
  expect(
    utils.getByRole("link", { name: "Log In with Clever" })
  ).toBeInTheDocument();
  expect(
    utils.getByRole("button", { name: "Login with SAML IdP 0" })
  ).toBeInTheDocument();
  expect(
    utils.getByRole("button", { name: "Login with SAML IdP 1" })
  ).toBeInTheDocument();

  // make sure that clicking them works
  userEvent.click(basicAuthButton);

  expect(
    utils.getByRole("textbox", { name: "Barcode input" })
  ).toBeInTheDocument();
  expect(utils.getByRole("button", { name: "Login" })).toBeInTheDocument();
  expect(utils.queryByText("Login with SAML IdP 0")).not.toBeInTheDocument();
  const backToSelection = utils.getByRole("button", {
    name: "Back to selection"
  });
  expect(backToSelection).toBeInTheDocument();

  // going back should work too
  userEvent.click(backToSelection);
  expect(
    utils.getByRole("link", { name: "Log In with Clever" })
  ).toBeInTheDocument();
});

test("shows combobox with five auth methods configured", () => {
  const utils = render(<div>child</div>, {
    library: {
      ...fixtures.libraryData,
      authMethods: [...fourAuthMethods, fixtures.createSamlMethod(2)]
    }
  });

  // should be no button
  expect(
    utils.queryByRole("button", { name: "Login with SAML IdP 0" })
  ).not.toBeInTheDocument();

  // should show combobox
  const select = utils.getByRole("combobox", { name: "Choose login method" });
  expect(select).toBeInTheDocument();
  expect(utils.getByRole("option", { name: "Clever" }));
  expect(utils.getByRole("option", { name: "SAML IdP 0" }));
  expect(utils.getByRole("option", { name: "SAML IdP 1" }));
  expect(utils.getByRole("option", { name: "SAML IdP 2" }));
  expect(utils.getByRole("option", { name: "Library Barcode" }));

  // selecting one should show apropriate form / button
  userEvent.selectOptions(select, OPDS1.BasicAuthType);
  const barcodeInput = utils.getByRole("textbox", { name: "Barcode input" });
  expect(barcodeInput).toBeInTheDocument();

  // select another
  userEvent.selectOptions(select, "/saml-auth-url/1");
  expect(barcodeInput).not.toBeInTheDocument();
  expect(
    utils.getByRole("button", { name: "Login with SAML IdP 1" })
  ).toBeInTheDocument();
});

test("hides form when user becomes authenticated", async () => {
  mockUser({
    isAuthenticated: false
  });
  const utils = render(<div>child</div>, {
    library: {
      ...fixtures.libraryData,
      authMethods: [fixtures.cleverAuthMethod]
    }
  });

  // form is there
  const loginButton = utils.getByRole("link", { name: "Log In with Clever" });
  expect(loginButton).toBeInTheDocument();
  expect(mockHide).toHaveBeenCalledTimes(0);

  useUserSpy.mockReturnValue({ isAuthenticated: true } as any);
  utils.rerender(<div>child</div>);
  // hide gets called
  expect(mockHide).toHaveBeenCalledTimes(1);
});
