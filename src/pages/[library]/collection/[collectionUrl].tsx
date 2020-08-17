import * as React from "react";
import Collection from "components/Collection";
import { NextPage, GetServerSideProps } from "next";
import Page from "components/Page";
import withAppProps, { AppProps } from "dataflow/withAppProps";

type Props = AppProps;

const CollectionPage: NextPage<Props> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <Collection title={`${library?.catalogName} Home`} />
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default CollectionPage;
