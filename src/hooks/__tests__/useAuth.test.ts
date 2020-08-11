import { getAccessToken } from "../useAuth";
import CleverAuthPlugin from "../../auth/cleverAuthPlugin";

describe("getAccessToken", () => {
  const { location } = window;

  beforeEach(() => {
    delete window.location;
  });

  afterEach(() => {
    window.location = location;
    jest.restoreAllMocks();
  });

  const mockSAMLToken = "potatokey";
  const mockRouterWithEmptyQuery = { query: {} };
  const mockRouterWithSAMLToken = {
    query: {
      //eslint-disable-next-line camelcase, @typescript-eslint/camelcase
      access_token: mockSAMLToken
    }
  };

  test("returns TOKEN_NOT_FOUND without a token when there is no access_token in query or access_token in window.location.hash", async () => {
    expect(getAccessToken(mockRouterWithEmptyQuery)).toStrictEqual({
      token: { credentials: {} },
      type: "TOKEN_NOT_FOUND"
    });
  });

  test("returns TOKEN_NOT_FOUND when CleverAuthPlugin.lookForCredentials() returns an error without credentials", async () => {
    window.location = { hash: "#access_token=fry" } as any;

    jest
      .spyOn(CleverAuthPlugin, "lookForCredentials")
      .mockImplementation(() => {
        "Oops something went wrong";
      });
    expect(getAccessToken(mockRouterWithEmptyQuery)).toStrictEqual({
      token: {
        credentials: {}
      },
      type: "TOKEN_NOT_FOUND"
    });
  });

  test("returns SAML token from router", async () => {
    expect(getAccessToken(mockRouterWithSAMLToken)).toStrictEqual({
      token: {
        credentials: {
          credentials: `Bearer ${mockSAMLToken}`
        }
      },
      type: "http://librarysimplified.org/authtype/SAML-2.0"
    });
  });

  test("returns Clever token when there is an access_token hashed in the window.location", async () => {
    window.location = { hash: "#access_token=fry" } as any;

    expect(getAccessToken(mockRouterWithEmptyQuery)).toStrictEqual({
      token: { credentials: { credentials: "Bearer fry", provider: "Clever" } },
      type: "Clever"
    });
  });
});
