import { getCredentials } from "../useAuth";
import CleverAuthPlugin from "../../auth/cleverAuthPlugin";
import { NextRouter } from "next/router";

describe("getCredentials", () => {
  const { location } = window;

  beforeEach(() => {
    delete (window as any).location;
  });

  afterEach(() => {
    window.location = location;
    jest.restoreAllMocks();
  });

  const mockSAMLToken = "potatokeyFH2";
  const mockRouterWithEmptyQuery = { query: {} } as NextRouter;
  const mockRouterWithSAMLToken = ({
    query: {
      //eslint-disable-next-line camelcase
      access_token: mockSAMLToken
    }
  } as unknown) as NextRouter;

  test("returns TOKEN_NOT_FOUND without a token when there is no access_token in query or access_token in window.location.hash", async () => {
    expect(getCredentials(mockRouterWithEmptyQuery)).toStrictEqual({
      credentials: "CREDENTIALS_NOT_FOUND",
      provider: "PROVIDER_NOT_FOUND"
    });
  });

  test("returns TOKEN_NOT_FOUND when CleverAuthPlugin.lookForCredentials() returns an error without credentials", async () => {
    window.location = { hash: "#access_token=fry6H3" } as any;

    jest
      .spyOn(CleverAuthPlugin, "lookForCredentials")
      .mockImplementation(() => {
        "Oops something went wrong";
      });
    expect(getCredentials(mockRouterWithEmptyQuery)).toStrictEqual({
      credentials: "CREDENTIALS_NOT_FOUND",
      provider: "PROVIDER_NOT_FOUND"
    });
  });

  test("returns SAML token from router", async () => {
    expect(getCredentials(mockRouterWithSAMLToken)).toStrictEqual({
      credentials: `Bearer ${mockSAMLToken}`,
      provider: "http://librarysimplified.org/authtype/SAML-2.0"
    });
  });

  test("returns Clever token when there is an access_token hashed in the window.location", async () => {
    window.location = { hash: "#access_token=fry6H3" } as any;

    expect(getCredentials(mockRouterWithEmptyQuery)).toStrictEqual({
      credentials: "Bearer fry6H3",
      provider: "Clever"
    });
  });
});
