import * as React from "react";
import Layout from "../../../components/Layout";
import Collection from "../../../components/Collection";
import MultiLibraryPage from "../../../components/MultiLibraryPage";

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
