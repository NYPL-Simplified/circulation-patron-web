import React from "react";
import WebpubViewer from "components/WebpubViewer";
import Page from "components/Page";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import withAppProps, { AppProps } from "dataflow/withAppProps";

const BookPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      <WebpubViewer />
    </Page>
  );
};

export default BookPage;

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};
