import * as React from "react";
import Collection from "components/Collection";
import { NextPage, GetServerSideProps } from "next";
import Page from "components/Page";
import withAppProps, { AppProps } from "dataflow/withAppProps";

const CollectionPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <Collection title={`${library?.catalogName} Home`} />
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default CollectionPage;
