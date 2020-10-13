import * as React from "react";
import BookDetails from "../../../components/bookDetails";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LayoutPage from "components/LayoutPage";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";

const BookPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <BookDetails />
    </LayoutPage>
  );
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default BookPage;
