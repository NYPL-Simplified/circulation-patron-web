import * as React from "react";
import ErrorComponent from "../components/Error";
import { NextPage } from "next";
import { OPDS1 } from "interfaces";
import track from "analytics/track";
import ApplicationError from "errors";

const Error: NextPage<{
  errorInfo?: OPDS1.ProblemDocument;
}> = ({ errorInfo }) => {
  return <ErrorComponent info={errorInfo} />;
};

Error.getInitialProps = ({ res, err }) => {
  if (err) track.error(err);
  if (err instanceof ApplicationError) {
    return {
      errorInfo: err.info
    };
  }
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return {
    errorInfo: {
      status: statusCode,
      title: "Something went wrong",
      detail: "An unexpected error occurred."
    }
  };
};

export default Error;
