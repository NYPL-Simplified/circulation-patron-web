import * as React from "react";
import ErrorComponent from "../components/Error";
function Error({
  statusCode,
  title,
  detail
}: {
  statusCode: number;
  title?: string;
  detail?: string;
}) {
  return (
    <ErrorComponent statusCode={statusCode} title={title} detail={detail} />
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
