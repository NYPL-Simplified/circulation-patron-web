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
  auth: fixtures.unauthenticatedAuthState
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
const stateWithTwoProviders: State = merge<State>(fixtures.initialState, {
  auth: authStateWithTwoProviders
});

test("renders select when multiple providers present", async () => {
  const utils = render(
    <Auth>
      <div>children</div>
    </Auth>,
    {
      initialState: stateWithTwoProviders
    }
  );

  const select = utils.getByRole("combobox", { name: "Login Method" });
  expect(select).toBeInTheDocument();

  // should have two options
  expect(
    utils.getByRole("option", { name: "Library Barcode" })
  ).toBeInTheDocument();
  expect(utils.getByRole("option", { name: "SAML IdP" })).toBeInTheDocument();

  // should default to basic auth (first)
  expect(
    utils.getByRole("textbox", { name: "Barcode input" })
  ).toBeInTheDocument();
  expect(utils.getByLabelText("Pin input")).toBeInTheDocument();

  // should be able to change
  userEvent.selectOptions(select, fixtures.samlAuthProvider.id);

  expect(await utils.findByText("Login with SAML IdP")).toBeInTheDocument();
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
  expect(getCredentialsSpy).toHaveBeenCalledTimes(1);
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
  expect(fetchLoansSpy).toHaveBeenLastCalledWith(
    "http://test-cm.com/catalogUrl/loans"
  );
});
