import { NextPageContext } from "next";
import * as React from "react";
import MultiLibraryPage from "../../../components/MultiLibraryPage";
import { IS_MULTI_LIBRARY } from "../../../utils/env";
import Layout from "../../../components/Layout";
import BookDetails from "../../../components/bookDetails";

const BookPage = () => {
  return (
    <MultiLibraryPage>
      <Layout>
        <BookDetails />
      </Layout>
    </MultiLibraryPage>
  );
};

export default BookPage;

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) context.res.statusCode = 404;
  return {
    props: {}
  };
}
