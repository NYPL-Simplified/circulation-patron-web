import {
  AuthProvider,
  AuthMethod,
  BasicAuthMethod
} from "opds-web-client/lib/interfaces";

export const BASIC_AUTH_ID = "http://opds-spec.org/auth/basic";

/**
 * This is a typescript type guard used to narrow the type of the
 * passed in provider.
 */
function isBasicAuthProvider(
  provider: AuthProvider<AuthMethod | BasicAuthMethod>
): provider is AuthProvider<BasicAuthMethod> {
  const correctId = provider.id === BASIC_AUTH_ID;
  // const hasLabels = !!(provider.method as BasicAuthMethod).labels;
  const hasLabels = "labels" in provider.method;
  return correctId && hasLabels;
}

export function getBasicAuthProvider(
  providers: AuthProvider<AuthMethod>[] | null
): AuthProvider<BasicAuthMethod> | undefined {
  if (!providers) return undefined;
  for (const provider of providers) {
    if (isBasicAuthProvider(provider)) {
      return provider;
    }
  }
  return undefined;
}
