import * as React from "react";
import Collection from "components/Collection";
import { GetStaticPaths, NextPage } from "next";
import Page from "components/Page";
import { AppProps } from "dataflow/withAppProps";
import { CollectionData } from "interfaces";
import getStaticCollection from "dataflow/getStaticCollection";

const LibraryHome: NextPage<AppProps & { collection?: CollectionData }> = ({
  library,
  error,
  collection
}) => {
  return (
    <Page library={library} error={error}>
      <Collection
        collection={collection}
        title={`${library?.catalogName} Home`}
      />
    </Page>
  );
};

export const getStaticProps = getStaticCollection;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LibraryHome;
