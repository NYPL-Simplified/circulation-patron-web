import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LoginWrapper from "auth/LoginWrapper";
import LoginPicker from "auth/LoginPicker";
import OpenEbooksLoginPicker from "auth/OpenEbooksLoginPicker";
import { APP_CONFIG } from "utils/env";

const LoginPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <LoginWrapper>
        {APP_CONFIG.openebooks ? <OpenEbooksLoginPicker /> : <LoginPicker />}
      </LoginWrapper>
    </LayoutPage>
  );
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginPage;
