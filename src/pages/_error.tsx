import * as React from "react";
import ErrorComponent from "../components/Error";
import { NextPage } from "next";

const Error: NextPage<{
  statusCode: number;
  title?: string;
  detail?: string;
}> = ({ statusCode, title, detail }) => {
  return (
    <ErrorComponent statusCode={statusCode} title={title} detail={detail} />
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default Error;
