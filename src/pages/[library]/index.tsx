import * as React from "react";
import { NextPage, NextPageContext } from "next";

import Collection from "../../components/Collection";
import Layout from "../../components/Layout";
import MultiLibraryPage from "../../components/MultiLibraryPage";

import { IS_MULTI_LIBRARY } from "../../utils/env";

const LibraryHome: NextPage = () => {
  return (
    <MultiLibraryPage>
      <Layout showFormatFilter>
        <Collection />
      </Layout>
    </MultiLibraryPage>
  );
};

export default LibraryHome;

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) context.res.statusCode = 404;
  return {
    props: {}
  };
}
