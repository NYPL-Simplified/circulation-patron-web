import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { useRouter } from "next/router";
import extractParam from "dataflow/utils";
import useLibraryContext from "components/context/LibraryContext";
import { OPDS1 } from "interfaces";
// import BasicAuthForm from "auth/BasicAuthHandler";
import CleverAuthHandler from "auth/CleverAuthHandler";
import SamlAuthHandler from "auth/SamlAuthHandler";
import Login from 'auth/Login';

/**
 * - Render selector: none, buttons, or combobox
 * Our states are
 *  - No method selected
 *    - Render the selector
 *  - Method selected
 *    - Render the 
 */

const LoginPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <Login />
    </LayoutPage>
  );
};

// const LoginComponent = () => {
//   const router = useRouter();
//   const methodId = extractParam(router.query, "methodId");
//   const { authMethods } = useLibraryContext();

//   const selectedMethod = authMethods.find(m => m.id === methodId);

//   // TODO: if there is somehow no selected method, return to main login
//   if (!selectedMethod) return null;

//   switch (selectedMethod.type) {
//     case OPDS1.BasicAuthType:
//       return <BasicAuthForm method={selectedMethod} />;
//     case OPDS1.SamlAuthType:
//       return <SamlAuthHandler method={selectedMethod} />;
//     case OPDS1.CleverAuthType:
//       return <CleverAuthHandler method={selectedMethod} />;
//   }
// };

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginPage;
