import * as React from "react";
import Collection from "components/Collection";
import { NextPage, GetServerSideProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";

const CollectionPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <Collection />
    </LayoutPage>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default CollectionPage;
