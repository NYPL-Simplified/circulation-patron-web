import * as React from "react";
import { NextPage, GetServerSideProps } from "next";
import Page from "components/Page";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import MyBooks from "components/MyBooks";

const MyBooksPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <MyBooks />
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default MyBooksPage;
