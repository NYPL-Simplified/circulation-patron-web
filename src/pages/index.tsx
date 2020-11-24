import * as React from "react";
import { NextPage } from "next";
import { AppProps } from "dataflow/withAppProps";
import ErrorComponent from "components/Error";

const CollectionPage: NextPage<AppProps> = () => {
  return (
    <ErrorComponent
      info={{
        title: "Page Not Found",
        status: 404,
        detail:
          "This app does not have a home page. Url should contain a library slug: https://domain.com/<library>"
      }}
    />
  );
};

export default CollectionPage;
