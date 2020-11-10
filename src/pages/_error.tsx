import * as React from "react";
import ErrorComponent from "../components/Error";
import { NextPage } from "next";
import { OPDS1 } from "interfaces";
import track from "analytics/track";

const Error: NextPage<{
  error?: OPDS1.ProblemDocument;
}> = ({ error }) => {
  return <ErrorComponent error={error} />;
};

Error.getInitialProps = ({ res, err }) => {
  if (err) track.error(err);
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return {
    error: {
      status: statusCode,
      title: "Server Error",
      detail: "An unexpected error occurred on the server."
    }
  };
};

export default Error;
