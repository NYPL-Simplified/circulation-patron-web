import * as React from "react";
import { NextPageContext } from "next";
import MyBooks from "../../components/MyBooks";

import Layout from "../../components/Layout";
import { IS_MULTI_LIBRARY } from "../../utils/env";
import ErrorPage from "../404";

const Loans = ({ statusCode }: { statusCode?: number }) => {
  return <Layout>{statusCode === 404 ? <ErrorPage /> : <MyBooks />}</Layout>;
};

export default Loans;

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) {
    context.res.statusCode = 404;
    return { props: { statusCode: 404 } };
  }
  return {
    props: {}
  };
}
