import * as React from "react";
import { NextPage } from "next";
import Collection from "components/Collection";
import Layout from "components/Layout";

const LibraryHome: NextPage = () => {
  return (
    <Layout showFormatFilter>
      <Collection />
    </Layout>
  );
};

export default LibraryHome;
