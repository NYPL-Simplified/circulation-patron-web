import { getTokenFromUrl } from "../useAuth";
describe("getTokenFromUrl", () => {
  const { location } = window;

  beforeAll(() => {
    delete window.location;
  });

  afterAll(() => {
    window.location = location;
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
    expect(getTokenFromUrl(mockRouterWithEmptyQuery)).toStrictEqual({
      token: undefined,
      type: "TOKEN_NOT_FOUND"
    });
  });

  test("returns SAML token from router", async () => {
    expect(getTokenFromUrl(mockRouterWithSAMLToken)).toStrictEqual({
      token: `Bearer ${mockSAMLToken}`,
      type: "SAML"
    });
  });

  test("returns Clever token when there is an access_token hashed in the window.location", async () => {
    window.location = { hash: "#access_token=fry" } as any;

    expect(getTokenFromUrl(mockRouterWithEmptyQuery)).toStrictEqual({
      token: { credentials: { credentials: "Bearer fry", provider: "Clever" } },
      type: "Clever"
    });
  });
});
