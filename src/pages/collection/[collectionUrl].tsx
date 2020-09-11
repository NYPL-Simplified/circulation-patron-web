import * as React from "react";
import Collection from "components/Collection";
import { GetStaticPaths, NextPage } from "next";
import Page from "components/Page";
import getStaticCollection from "dataflow/getStaticCollection";
import { AppProps } from "dataflow/withAppProps";

type PageProps = {
  collection: any;
};

const CollectionPage: NextPage<AppProps & PageProps> = ({
  library,
  error,
  collection
}) => {
  return (
    <Page library={library} error={error}>
      <Collection collection={collection} />
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

export default CollectionPage;
