import * as React from "react";
import { NextPage } from "next";
import { AppProps } from "dataflow/withAppProps";
import ErrorComponent from "components/Error";

const CollectionPage: NextPage<AppProps> = () => {
  return <ErrorComponent />;
};

export default CollectionPage;
