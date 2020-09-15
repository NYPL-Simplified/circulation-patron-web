import * as React from "react";
import { NextPage, GetServerSideProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import MyBooks from "components/MyBooks";

const MyBooksPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <MyBooks />
    </LayoutPage>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default MyBooksPage;
