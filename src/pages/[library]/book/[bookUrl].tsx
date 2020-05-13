import { NextPageContext } from "next";
import * as React from "react";

import { IS_MULTI_LIBRARY } from "../../../utils/env";
import Layout from "../../../components/Layout";
import BookDetails from "../../../components/bookDetails";
import ErrorPage from "../../404";

const BookPage = ({ statusCode }: { statusCode?: number }) => {
  if (statusCode === 404) {
    return <ErrorPage />;
  }
  return (
    <Layout>
      <BookDetails />
    </Layout>
  );
};

export default BookPage;

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) {
    context.res.statusCode = 404;
    return { props: { statusCode: 404 } };
  }
  return {
    props: {}
  };
}
