import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LoginWrapper from "auth/LoginWrapper";
import { useRouter } from "next/router";
import extractParam from "dataflow/utils";
import useLibraryContext from "components/context/LibraryContext";
import BasicAuthHandler from "auth/BasicAuthHandler";
import { OPDS1 } from "interfaces";
import CleverAuthHandler from "auth/CleverAuthHandler";
import SamlAuthHandler from "auth/SamlAuthHandler";
import track from "analytics/track";
import ApplicationError from "errors";
import useLogin from "auth/useLogin";

const LoginHandlerPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <LoginWrapper>
        <LoginComponent />
      </LoginWrapper>
    </LayoutPage>
  );
};

const LoginComponent = () => {
  const router = useRouter();
  const { authMethods } = useLibraryContext();
  const methodId = extractParam(router.query, "methodId");
  const method = authMethods.find(m => m.id === methodId);
  const { initLogin } = useLogin();

  if (!method) {
    track.error(
      new ApplicationError({
        title: "Login Method Not Available",
        detail: `Attempted to access authentication method that was not found. Method ID: ${methodId}`
      })
    );
    // go back to base login page
    initLogin();
  }

  switch (method?.type) {
    case OPDS1.BasicAuthType:
      return <BasicAuthHandler method={method} />;
    case OPDS1.SamlAuthType:
      return <SamlAuthHandler method={method} />;
    case OPDS1.CleverAuthType:
      return <CleverAuthHandler method={method} />;
    default:
      return <p>This authentication method is not supported.</p>;
  }
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginHandlerPage;
