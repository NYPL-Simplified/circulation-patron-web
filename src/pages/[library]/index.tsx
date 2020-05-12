import * as React from "react";
import { NextPage } from "next";
import Collection from "../../components/Collection";
import Layout from "../../components/Layout";
import MultiLibraryPage from "../../components/MultiLibraryPage";

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
