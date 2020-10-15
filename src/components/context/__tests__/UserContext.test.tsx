/* eslint-disable camelcase */
import * as React from "react";
import { OPDS1 } from "interfaces";
import { act, fixtures, render } from "test-utils";
import Cookie from "js-cookie";
import * as router from "next/router";
import useUser, { UserProvider } from "components/context/UserContext";
import mockAuthenticatedOnce from "test-utils/mockAuthState";
import * as swr from "swr";
import { makeSwrResponse } from "test-utils/mockSwr";

const mockSWR = jest.spyOn(swr, "default");

const str = JSON.stringify;
const mockCookie = Cookie as any;
const useRouterSpy = jest.spyOn(router, "useRouter");

const mutateMock = jest.fn();
const defaultMock = makeSwrResponse({
  data: fixtures.emptyCollection,
  mutate: mutateMock
});
mockSWR.mockReturnValue(defaultMock);

/**
 * This file tests both UserContext and useCredentials, as
 * the latter is only used within the former. It doesn't have
 * to pass the user provider in to the render function, because
 * render wraps everything with our ContextProvider already (see text-utils/index)
 */
function renderUserContext() {
  return render(<UserProvider>child</UserProvider>);
}

beforeEach(() => {
  window.location.hash = "";
  useRouterSpy.mockReturnValue({
    query: {},
    replace: jest.fn()
  } as any);
});

test("fetches loans when credentials are present", async () => {
  mockAuthenticatedOnce();
  renderUserContext();

  expect(mockSWR).toHaveBeenCalledWith(
    ["/shelf-url", "some-token", "http://opds-spec.org/auth/basic"],
    expect.anything(),
    expect.anything()
  );
});

test("does not fetch loans if no credentials are present", () => {
  mockAuthenticatedOnce(null);
  renderUserContext();
  expect(fetchMock).toHaveBeenCalledTimes(0);
});

const mockReplace = jest.fn(() => {
  window.location.hash = "";
});

test("extracts clever tokens from the url", () => {
  window.location.hash = "#access_token=fry6H3" as any;

  useRouterSpy.mockReturnValue({ replace: mockReplace, query: {} } as any);
  renderUserContext();

  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer fry6H3", methodType: OPDS1.CleverAuthType })
  );
  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer fry6H3",
      "http://librarysimplified.org/authtype/OAuth-with-intermediary"
    ],
    expect.anything(),
    expect.anything()
  );

  // mock the router
  expect(mockReplace).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith(
    "http://test-domain.com/",
    undefined,
    { shallow: true }
  );
});

test("extracts SAML tokens from the url", () => {
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "saml-token" }
  } as any);
  renderUserContext();

  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer saml-token", methodType: OPDS1.SamlAuthType })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer saml-token",
      "http://librarysimplified.org/authtype/SAML-2.0"
    ],
    expect.anything(),
    expect.anything()
  );

  expect(mockReplace).toHaveBeenCalledWith(
    "http://test-domain.com/",
    undefined,
    { shallow: true }
  );
});

test("sign out clears cookies and data", async () => {
  mockAuthenticatedOnce();
  let extractedSignOut: any = null;
  function Extractor() {
    const { signOut } = useUser();
    extractedSignOut = signOut;
    return <div>hello</div>;
  }
  render(
    <UserProvider>
      <Extractor />
    </UserProvider>
  );

  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  // make sure fetch was called and you have the right data
  expect(mockSWR).toHaveBeenCalledWith(
    ["/shelf-url", "some-token", "http://opds-spec.org/auth/basic"],
    expect.anything(),
    expect.anything()
  );

  // now sign out
  act(() => {
    extractedSignOut();
  });

  // should have removed cookie
  expect(Cookie.remove).toHaveBeenCalledTimes(1);
  expect(Cookie.remove).toHaveBeenCalledWith("CPW_AUTH_COOKIE/testlib");

  // data should be revalidated
  expect(mutateMock).toHaveBeenCalledTimes(1);
});

test("sign in sets cookie", async () => {
  let extractedSignIn: any = null;
  function Extractor() {
    const { signIn, token } = useUser();
    extractedSignIn = signIn;
    return <div>{token}</div>;
  }
  render(
    <UserProvider>
      <Extractor />
    </UserProvider>
  );
  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  expect(Cookie.set).toHaveBeenCalledTimes(0);

  act(() => extractedSignIn("a-token", { type: "type" }));

  expect(mockCookie.set).toHaveBeenCalledTimes(1);
  expect(mockCookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "a-token", methodType: "type" })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    ["/shelf-url", "a-token", "type"],
    expect.anything(),
    expect.anything()
  );
});
