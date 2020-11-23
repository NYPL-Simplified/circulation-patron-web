/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "../components/context/LibraryContext";
import { H2 } from "../components/Text";
import Stack from "../components/Stack";
import useUser from "components/context/UserContext";
import LoadingIndicator from "components/LoadingIndicator";
import extractParam from "dataflow/utils";
import useLinkUtils from "hooks/useLinkUtils";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";
import Head from "next/head";
import BreadcrumbBar from "components/BreadcrumbBar";

/**
 * Redirects on success
 * Shows loader if the state is still loading
 * Adds wrapping components for styling
 */
const LoginWrapper: React.FC = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  const { catalogName } = useLibraryContext();
  const { buildMultiLibraryLink } = useLinkUtils();
  const { push, query } = useRouter();
  const redirectUrl = extractParam(query, LOGIN_REDIRECT_QUERY_PARAM);

  // the success url is the catalog root if none is set in the url param.
  const successUrl = redirectUrl || buildMultiLibraryLink("/");
  const success = React.useCallback(() => {
    push(successUrl, undefined, { shallow: true });
  }, [push, successUrl]);

  /**
   * If the user becomes authenticated, we can redirect
   * to the successUrl
   */
  React.useEffect(() => {
    if (isAuthenticated) success();
  }, [isAuthenticated, success]);

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
