import * as React from "react";
import { fixtures, render, waitFor } from "test-utils";
import BasicAuthHandler from "auth/BasicAuthHandler";
import { ClientBasicMethod, OPDS1 } from "interfaces";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";
import Cookie from "js-cookie";
import { generateCredentials } from "utils/auth";
import { UserProvider } from "components/context/UserContext";

const mockCookie = Cookie as any;
const method: ClientBasicMethod = {
  id: "basic-id",
  labels: {
    login: "Barcode",
    password: "Pin"
  },
  type: OPDS1.BasicAuthType,
  description: "Library Barcode"
};

beforeEach(() => fetchMock.resetMocks());

test("displays form", () => {
  const utils = render(<BasicAuthHandler method={method} />);

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

test("sumbits", async () => {
  // give the mock a delay to allow loading state to appear
  fetchMock.mockResponseOnce(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve(JSON.stringify(fixtures.loans)), 100)
      )
  );
  const utils = render(
    <UserProvider>
      <BasicAuthHandler method={method} />
    </UserProvider>
  );

  // act
  const barcode = utils.getByLabelText("Barcode input");
  const pin = utils.getByLabelText("Pin input");
  userEvent.type(barcode, "1234");
  userEvent.type(pin, "pinpin");
  const loginButton = utils.getByRole("button", { name: "Login" });
  userEvent.click(loginButton);

  const token = generateCredentials("1234", "pinpin");

  // shows a loading state
  const loadingButton = await utils.findByLabelText("Signing in...");
  expect(loadingButton).toBeInTheDocument();
  expect(loadingButton).toBeDisabled();

  // assert
  // we wrap this in waitFor because the handleSubmit from react-hook-form has
  // async code in it
  await waitFor(() => {
    // we set the cookie
    expect(Cookie.set).toHaveBeenCalledTimes(1);
    expect(Cookie.set).toHaveBeenCalledWith(
      // the library slug is null because we are only running with one library
      "CPW_AUTH_COOKIE/testlib",
      JSON.stringify({
        token,
        methodType: OPDS1.BasicAuthType
      })
    );

    // we also trigger a loans request with the cookie
    expect(fetchMock).toHaveBeenCalledWith("/shelf-url", {
      headers: { Authorization: token, "X-Requested-With": "XMLHttpRequest" }
    });
  });
});

test("displays client error when inputs are unfilled", async () => {
  const utils = render(<BasicAuthHandler method={method} />);

  // don't fill form, but click login
  const loginButton = utils.getByRole("button", { name: "Login" });
  userEvent.click(loginButton);

  // assert
  await utils.findByText("Your Barcode is required.");
  await utils.findByText("Your Pin is required.");
  expect(fetchMock).toHaveBeenCalledTimes(0);
});

test("displays server error", async () => {
  // set fake credentials in the cookie to trigger a fetch
  mockCookie.get.mockReturnValueOnce(
    JSON.stringify({ token: "token", methodType: "/type" })
  );
  const problemdoc: OPDS1.ProblemDocument = {
    detail: "Wrong username.",
    title: "Invalid Credentials",
    type: "/invalid-creds",
    status: 401
  };
  fetchMock.mockResponseOnce(JSON.stringify(problemdoc), {
    status: 401
  });
  const utils = render(
    <UserProvider>
      <BasicAuthHandler method={method} />
    </UserProvider>
  );

  expect(fetchMock).toHaveBeenCalledWith("/shelf-url", {
    headers: {
      Authorization: "token",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  const serverError = await utils.findByText(
    "Invalid Credentials: Wrong username."
  );
  expect(serverError).toBeInTheDocument();
});

test("accepts different input labels", async () => {
  fetchMock.mockResponseOnce(JSON.stringify(fixtures.loans));
  const methodWithLabels: ClientBasicMethod = {
    ...fixtures.basicAuthMethod,
    id: "basic-id",
    labels: {
      login: "Username",
      password: "Password"
    }
  };
  const utils = render(<BasicAuthHandler method={methodWithLabels} />);

  expect(utils.getByLabelText("Username input")).toBeInTheDocument();
  expect(utils.getByLabelText("Password input")).toBeInTheDocument();
});
