import React from "react";
import Page from "components/Page";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { AXISNOW_DECRYPT } from "utils/env";
import ErrorComponent from "components/Error";
import dynamic from "next/dynamic";

const Viewer = AXISNOW_DECRYPT
  ? dynamic(() => import("components/WebpubViewer"))
  : undefined;

const ReaderPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <Page library={library} error={error}>
      {Viewer ? (
        <Viewer />
      ) : (
        <ErrorComponent
          title="Cannot Decrypt Resource"
          statusCode={403}
          detail="This app does not have access to the AxisNow Decryptor required to view this content."
        />
      )}
    </Page>
  );
};

export default ReaderPage;

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};
