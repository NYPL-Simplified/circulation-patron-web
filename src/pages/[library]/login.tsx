import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { Login } from "auth/AuthModal";
import { useRouter } from "next/router";
import useLinkUtils from "hooks/useLinkUtils";
import useUser from "components/context/UserContext";
import extractParam from 'dataflow/utils';

const LoginPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <LoginComponent />
    </LayoutPage>
  );
};

const LoginComponent = () => {
  const { buildMultiLibraryLink } = useLinkUtils();
  const { push, query } = useRouter();
  const { isAuthenticated } = useUser();
  const redirectUrl = extractParam(query, "loginRedirect");

  const successUrl = redirectUrl || buildMultiLibraryLink("/");
  const success = React.useCallback(() => {
    push(successUrl, undefined, { shallow: true });
  }, [push, successUrl]);

  /**
   * If the user becomes authenticated, we can hide the form
   */
  React.useEffect(() => {
    if (isAuthenticated) success();
  }, [isAuthenticated, success]);

  return <Login />;
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginPage;
