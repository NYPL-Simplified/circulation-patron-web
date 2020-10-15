import { AuthCredentials, OPDS1 } from "interfaces";
import Cookie from "js-cookie";

const mockCookie = Cookie as any;

export const creds: AuthCredentials = {
  token: "some-token",
  methodType: OPDS1.BasicAuthType
};

const str = JSON.stringify;

export default function mockAuthenticatedOnce(
  credentials: AuthCredentials | null = creds
) {
  mockCookie.get.mockReturnValueOnce(str(credentials));
}

export function mockAuthenticated(credentials: AuthCredentials | null = creds) {
  mockCookie.get.mockReturnValue(str(credentials));
}
