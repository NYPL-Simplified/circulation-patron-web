import * as React from "react";
import { render, fixtures, actions, waitFor, fetcher } from "../../test-utils";

import merge from "deepmerge";
import Auth from "../Auth";
import { State } from "opds-web-client/lib/state";
import { AuthState } from "opds-web-client/lib/reducers/auth";
import fetchMock from "fetch-mock-jest";
import { AuthCredentials } from "opds-web-client/lib/interfaces";
import userEvent from "@testing-library/user-event";

const stateWithAuth: State = merge<State>(fixtures.initialState, {
  auth: fixtures.unauthenticatedAuthState,
  loans: {
    url: "/loans-url",
    books: []
  }
});

afterEach(() => {
  fetchMock.mockClear();
  // don't call mock reset because that removes the fetch mock, which will make next tests fail
  // fetchMock.mockReset();
});
test("shows overlay on unauthenticated request", async () => {
  // mock fetch to return a 401
  fetchMock.get("/some-collection", {
    status: 401,
    body: merge({}, fixtures.server401Response)
  });

  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithAuth
    }
  );
  // overlay should not be shown yet
  const modal = utils.getByLabelText("Sign In Form");
  expect(modal).toBeInTheDocument();
  expect(modal).toHaveStyle("display: none");

  /**
   * we need to dispatch some action that makes a server request
   * and will receive our mocked 401
   */
  utils.dispatch(actions.fetchCollection("/some-collection"));
  // now see that the overlay is shown.
  await waitFor(() => expect(modal).toHaveStyle("display: block"));
});

const authStateWithShowForm: AuthState = {
  showForm: true,
  callback: jest.fn(),
  cancel: jest.fn(),
  credentials: null,
  title: "form",
  error: null,
  attemptedProvider: null,
  providers: [fixtures.basicAuthProvider]
};
const stateWithShowForm: State = merge<State>(fixtures.initialState, {
  auth: authStateWithShowForm
});

test("shows overlay when showForm is true", async () => {
  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithShowForm
    }
  );
  // overlay should be shown
  const modal = utils.getByLabelText("Sign In Form");
  expect(modal).toBeInTheDocument();
  expect(modal).toHaveStyle("display: block");
});

test("renders auth form provided in authPlugin", async () => {
  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithShowForm
    }
  );
  // overlay should be shown
  const modal = utils.getByLabelText("Sign In Form");
  expect(modal).toBeInTheDocument();
  expect(modal).toHaveStyle("display: block");
  // should include the BasicAuthForm
  expect(utils.getByLabelText("Pin input")).toBeInTheDocument();
});

const authStateWithClever: AuthState = {
  showForm: true,
  callback: jest.fn(),
  cancel: jest.fn(),
  credentials: null,
  title: "form",
  error: null,
  attemptedProvider: null,
  providers: [fixtures.cleverAuthProvider, fixtures.samlAuthProvider]
};

const authStateWithFiveProviders: AuthState = {
  showForm: true,
  callback: jest.fn(),
  cancel: jest.fn(),
  credentials: null,
  title: "form",
  error: null,
  attemptedProvider: null,
  providers: [
    fixtures.basicAuthProvider,
    fixtures.samlAuthProvider,
    fixtures.cleverAuthProvider,
    fixtures.samlAuthProvider,
    fixtures.samlAuthProvider
  ]
};

const authStateWithTwoProviders: AuthState = {
  showForm: true,
  callback: jest.fn(),
  cancel: jest.fn(),
  credentials: null,
  title: "form",
  error: null,
  attemptedProvider: null,
  providers: [fixtures.basicAuthProvider, fixtures.samlAuthProvider]
};

const stateWithFiveProviders: State = merge<State>(fixtures.initialState, {
  auth: authStateWithFiveProviders
});

const stateWithTwoProviders: State = merge<State>(fixtures.initialState, {
  auth: authStateWithTwoProviders
});

const stateWithCleverProvider: State = merge<State>(fixtures.initialState, {
  auth: authStateWithClever
});

test("renders select comboxbox when more than four providers present", async () => {
  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithFiveProviders
    }
  );

  const select = utils.getByRole("combobox", { name: "Login Method" });
  expect(select).toBeInTheDocument();

  // should have five options
  expect(utils.getByRole("option", { name: "Clever" })).toBeInTheDocument();
  expect(
    utils.getByRole("option", { name: "Library Barcode" })
  ).toBeInTheDocument();
  expect(utils.getAllByRole("option", { name: "SAML IdP" })).toHaveLength(3);

  // should be able to change provider
  userEvent.selectOptions(select, fixtures.samlAuthProvider.id);

  expect(await utils.findByText("Login with SAML IdP")).toBeInTheDocument();
});

test("renders select Clever with multiple providers present", async () => {
  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithCleverProvider
    }
  );

  // should have two options
  expect(utils.getByLabelText("Login to SAML IdP")).toBeInTheDocument();

  expect(
    utils.getByRole("button", {
      name: "Log In with Clever"
    })
  ).toBeInTheDocument();

  // should be able to click to select Clever

  userEvent.click(
    utils.getByRole("button", {
      name: "Log In with Clever"
    })
  );
  expect(await utils.findByLabelText("Log In with Clever")).toBeInTheDocument();
});

test("renders provider buttons when multiple providers present", async () => {
  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithTwoProviders
    }
  );

  // should have two options
  expect(
    utils.getByRole("button", { name: "Login to Library Barcode" })
  ).toBeInTheDocument();
  expect(
    utils.getByRole("button", { name: "Login to SAML IdP" })
  ).toBeInTheDocument();

  userEvent.click(utils.getByRole("button", { name: "Login to SAML IdP" }));

  // /* after clicking SAML IdP button Login with SAML IdP text appears */
  expect(
    utils.queryByRole("button", { name: "Login to Library Barcode" })
  ).toBe(null);
  expect(utils.queryByRole("button", { name: "Login to SAML IdP" })).toBe(null);
});

test("displays message when no auth provider configured", async () => {
  const authStateWithoutProvider: AuthState = {
    showForm: true,
    callback: jest.fn(),
    cancel: jest.fn(),
    credentials: null,
    title: "form",
    error: null,
    attemptedProvider: null,
    providers: []
  };
  const stateWithShowForm: State = merge<State>(
    fixtures.initialState,
    {
      auth: authStateWithoutProvider
    },
    {
      arrayMerge: (a, b) => b
    }
  );
  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithShowForm
    }
  );
  // overlay should be shown
  const modal = await utils.findByLabelText("Sign In Form");
  expect(modal).toBeInTheDocument();
  expect(modal).toHaveStyle("display: block");

  expect(
    utils.getByText(
      "There is no Auth Plugin configured for the selected Auth Provider."
    )
  ).toBeInTheDocument();
});

test("attempts to get credentials from cookies", async () => {
  const getCredentialsSpy = jest.spyOn(fetcher, "getAuthCredentials");

  render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithShowForm
    }
  );
  // TODO: Is it okay for this to be called 2x?
  expect(getCredentialsSpy).toHaveBeenCalledTimes(2);
});

test("attempts to save auth credentials", async () => {
  const credentials: AuthCredentials = {
    credentials: "auth-cred",
    provider: fixtures.basicAuthId
  };
  const getCredentialsSpy = jest.spyOn(fetcher, "getAuthCredentials");
  getCredentialsSpy.mockReturnValue(credentials);
  const setCredentialsSpy = jest.spyOn(fetcher, "setAuthCredentials");
  const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");

  render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithAuth
    }
  );
  expect(setCredentialsSpy).toHaveBeenCalledTimes(1);
  expect(setCredentialsSpy).toHaveBeenCalledWith(credentials);
  expect(fetchLoansSpy).toHaveBeenCalledTimes(1);
  expect(fetchLoansSpy).toHaveBeenLastCalledWith("/loans-url");
});
