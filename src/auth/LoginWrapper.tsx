/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "../components/context/LibraryContext";
import { Text, H2 } from "../components/Text";
import Stack from "../components/Stack";
import useUser from "components/context/UserContext";
import LoadingIndicator from "components/LoadingIndicator";
import { useRouter } from "next/router";
import Head from "next/head";
import BreadcrumbBar from "components/BreadcrumbBar";
import useLoginRedirectUrl from "auth/useLoginRedirect";

/**
 * Redirects on success
 * Shows loader if the state is still loading
 * Adds wrapping components for styling
 */
const LoginWrapper: React.FC = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  const { catalogName } = useLibraryContext();
  const { push } = useRouter();
  const router = useRouter();
  const { successPath } = useLoginRedirectUrl();
  const [error, setError] = React.useState<string | null>(null);

  /**
   * If the user becomes authenticated, we can redirect
   * to the successUrl
   */
  React.useEffect(() => {
    if (isAuthenticated) {
      push(successPath, undefined, { shallow: true });
    }
  }, [isAuthenticated, push, successPath]);

  React.useEffect(() => {
    const queryParams = router.query;
    const nextUrl = queryParams.nextUrl;
    if (nextUrl) {
      const errObj = nextUrl.split("#")[1];
      setError(errObj);
    }
  }, [router.query]);

  return (
    <div
      sx={{
        flex: 1
      }}
    >
      <Head>
        <title>Login</title>
      </Head>
      <BreadcrumbBar currentLocation="Login" />
      <div
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Stack
          direction="column"
          sx={{ p: 4, m: 4, border: "solid", borderRadius: "card" }}
        >
          <div sx={{ textAlign: "center", p: 0 }}>
            <H2>{catalogName}</H2>
            <h4>Login</h4>
          </div>
          {/* when we just become authenticated, we display the
              loading indicator until the page redirects away
           */}
          {error && (
            <Text variant="text.callouts.regular" sx={{ color: "ui.error" }}>
              {error}
            </Text>
          )}

          {isLoading || isAuthenticated ? (
            <Stack direction="column" sx={{ alignItems: "center" }}>
              <LoadingIndicator />
              Logging in...
            </Stack>
          ) : (
            children
          )}
        </Stack>
      </div>
    </div>
  );
};

export default LoginWrapper;
