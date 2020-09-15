import * as React from "react";
import BookDetails from "components/bookDetails";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LayoutPage from "components/LayoutPage";
import { NextPage, GetServerSideProps } from "next";

const BookPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <BookDetails />
    </LayoutPage>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps();

export default BookPage;
