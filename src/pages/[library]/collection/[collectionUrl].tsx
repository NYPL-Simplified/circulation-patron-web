import * as React from "react";
import { NextPageContext } from "next";

import Collection from "../../../components/Collection";
import Layout from "../../../components/Layout";
import ErrorPage from "../../404";

import { IS_MULTI_LIBRARY } from "../../../utils/env";

const CollectionPage = ({ statusCode }: { statusCode?: number }) => {
  return (
    <Layout showFormatFilter>
      {statusCode === 404 ? <ErrorPage /> : <Collection />}
    </Layout>
  );
};

export default CollectionPage;

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) {
    context.res.statusCode = 404;
    return { props: { statusCode: 404 } };
  }
  return {
    props: {}
  };
}
