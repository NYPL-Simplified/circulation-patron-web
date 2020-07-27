import * as React from "react";
import { render, fixtures, actions, waitFor } from "../../test-utils";
import merge from "deepmerge";
import BasicAuthForm from "auth/BasicAuthForm";
import { AuthProvider, BasicAuthMethod } from "opds-web-client/lib/interfaces";
import { AuthState } from "opds-web-client/lib/reducers/auth";
import { State } from "opds-web-client/lib/state";
import userEvent from "@testing-library/user-event";
import * as authDep from "opds-web-client/lib/utils/auth";

const provider: AuthProvider<BasicAuthMethod> = {
  id: "provider-id",
  plugin: {
    type: "basic-auth-type",
    formComponent: BasicAuthForm,
    buttonComponent: jest.fn(),
    lookForCredentials: jest.fn()
  },
  method: {
    labels: {
      login: "Barcode",
      password: "Pin"
    },
    type: "basic-auth-type",
    description: "Library Barcode"
  }
};

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
  providers: [provider]
};

test("displays form", () => {
  const utils = render(<BasicAuthForm provider={provider} />, {
    initialState: merge<State>(fixtures.initialState, {
      auth: authState
    })
  });

  const barcode = utils.getByLabelText("Barcode input");
  const pin = utils.getByLabelText("Pin input");
  expect(barcode).toBeInTheDocument();
  expect(pin).toBeInTheDocument();
  expect(utils.getByRole("button", { name: "Login" })).toBeInTheDocument();

  userEvent.type(barcode, "1234");
  userEvent.type(pin, "pinpin");

  expect(barcode).toHaveValue("1234");
  expect(pin).toHaveValue("pinpin");
});

/**
 * Mock generate-credentials here so we can test this properly
 */
const mockedGenerateCredentials = jest
  .spyOn(authDep, "generateCredentials")
  .mockReturnValue("generated-credentials");

test("sumbits", async () => {
  const mockSaveAuthCredentials = jest.spyOn(actions, "saveAuthCredentials");

  const utils = render(<BasicAuthForm provider={provider} />, {
    initialState: merge<State>(fixtures.initialState, {
      auth: authState
    })
  });

  // act
  const barcode = utils.getByLabelText("Barcode input");
  const pin = utils.getByLabelText("Pin input");
  userEvent.type(barcode, "1234");
  userEvent.type(pin, "pinpin");
  const loginButton = utils.getByRole("button", { name: "Login" });
  userEvent.click(loginButton);

  // assert
  // we wrap this in waitFor because the handleSubmit from react-hook-form has
  // async code in it
  await waitFor(() => {
    expect(utils.dispatch).toHaveBeenCalledTimes(1);
    expect(mockedGenerateCredentials).toHaveBeenCalledTimes(1);
    expect(mockedGenerateCredentials).toHaveBeenCalledWith("1234", "pinpin");
    expect(mockSaveAuthCredentials).toHaveBeenCalledWith({
      provider: "provider-id",
      credentials: "generated-credentials"
    });
    expect(authCallback).toHaveBeenCalledTimes(1);
  });
});

test("displays client error when unfilled", async () => {
  const utils = render(<BasicAuthForm provider={provider} />, {
    initialState: merge<State>(fixtures.initialState, {
      auth: authState
    })
  });

  // don't fill form, but click login
  const loginButton = utils.getByRole("button", { name: "Login" });
  userEvent.click(loginButton);

  // assert
  await utils.findByText("Your Barcode is required.");
  await utils.findByText("Your Pin is required.");
  expect(utils.dispatch).toHaveBeenCalledTimes(0);
  expect(mockedGenerateCredentials).toHaveBeenCalledTimes(0);
  expect(authCallback).toHaveBeenCalledTimes(0);
});

const authStateWithError: AuthState = {
  showForm: true,
  callback: authCallback,
  cancel: cancel,
  credentials: {
    provider: "auth-provider",
    credentials: "auth-cred"
  },
  title: "auth-title",
  error: "Server error string",
  attemptedProvider: null,
  providers: [provider]
};
test("displays server error", async () => {
  const utils = render(<BasicAuthForm provider={provider} />, {
    initialState: merge<State>(fixtures.initialState, {
      auth: authStateWithError
    })
  });

  const serverError = utils.getByText("Error: Server error string");
  expect(serverError).toBeInTheDocument();
});

test("accepts different input labels", async () => {
  const providerWithLabel: AuthProvider<BasicAuthMethod> = {
    id: "provider-id",
    plugin: {
      type: "basic-auth-type",
      formComponent: BasicAuthForm,
      buttonComponent: jest.fn(),
      lookForCredentials: jest.fn()
    },
    method: {
      labels: {
        login: "Username",
        password: "Password"
      },
      type: "basic-auth-type",
      description: "Library Barcode"
    }
  };
  const authStateWithLabel: AuthState = {
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
    providers: [providerWithLabel]
  };
  const stateWithLabels = merge<State>(fixtures.initialState, {
    auth: authStateWithLabel
  });
  const utils = render(<BasicAuthForm provider={providerWithLabel} />, {
    initialState: stateWithLabels
  });

  expect(utils.getByLabelText("Username input")).toBeInTheDocument();
  expect(utils.getByLabelText("Password input")).toBeInTheDocument();
  expect(utils.getByText("Login")).toBeInTheDocument();
});
