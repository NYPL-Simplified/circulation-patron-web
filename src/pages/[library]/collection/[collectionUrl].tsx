import * as React from "react";
import { NextPageContext } from "next";

import Collection from "../../../components/Collection";
import Layout from "../../../components/Layout";
import MultiLibraryPage from "../../../components/MultiLibraryPage";
import { IS_MULTI_LIBRARY } from "../../../utils/env";

const CollectionPage = () => {
  return (
    <MultiLibraryPage>
      <Layout showFormatFilter>
        <Collection />
      </Layout>
    </MultiLibraryPage>
  );
};

export default CollectionPage;

export async function getServerSideProps(context: NextPageContext) {
  if (!IS_MULTI_LIBRARY && context && context.res) context.res.statusCode = 404;
  return {
    props: {}
  };
}
