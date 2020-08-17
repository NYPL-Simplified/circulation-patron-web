import * as React from "react";
import BookDetails from "components/bookDetails";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import Page from "components/Page";
import { NextPage, GetServerSideProps } from "next";

const BookPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <BookDetails />
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default BookPage;
