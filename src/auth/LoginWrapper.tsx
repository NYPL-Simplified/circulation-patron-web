/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "../components/context/LibraryContext";
import { H2 } from "../components/Text";
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
  const { successPath } = useLoginRedirectUrl();

  /**
   * If the user becomes authenticated, we can redirect
   * to the successUrl
   */
  React.useEffect(() => {
    if (isAuthenticated) {
      push(successPath, undefined, { shallow: true });
    }
  }, [isAuthenticated, push, successPath]);

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
          {isLoading ? (
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
