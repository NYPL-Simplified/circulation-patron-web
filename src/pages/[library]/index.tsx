import * as React from "react";
import Collection from "components/Collection";
import { NextPage, GetServerSideProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";

const LibraryHome: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <Collection title={`${library?.catalogName} Home`} />
    </LayoutPage>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default LibraryHome;
