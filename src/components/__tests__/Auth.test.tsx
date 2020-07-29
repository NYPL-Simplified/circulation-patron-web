import * as React from "react";
import { render, fixtures, actions, waitFor, fetcher } from "../../test-utils";
import merge from "deepmerge";
import Auth from "../Auth";
import { State } from "opds-web-client/lib/state";
import { AuthState } from "opds-web-client/lib/reducers/auth";
import fetchMock from "fetch-mock-jest";
import { AuthCredentials } from "opds-web-client/lib/interfaces";

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
  const modal = utils.getByLabelText("Sign In");
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
  const modal = utils.getByLabelText("Sign In");
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
  const modal = utils.getByLabelText("Sign In");
  expect(modal).toBeInTheDocument();
  expect(modal).toHaveStyle("display: block");
  // should include the BasicAuthForm
  expect(utils.getByLabelText("Pin")).toBeInTheDocument();
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
  const modal = utils.getByLabelText("Sign In");
  expect(modal).toBeInTheDocument();
  expect(modal).toHaveStyle("display: block");

  expect(
    utils.getByText("Basic auth provider is missing.")
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
    provider: fixtures.basicAuthType
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
