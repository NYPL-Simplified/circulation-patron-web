import * as React from "react";
import { IS_MULTI_LIBRARY } from "../utils/env";
import Error from "./Error";
import Layout from "./Layout";

const SingleLibraryPage: React.FC<{ showFormatFilter?: boolean }> = ({
  children,
  showFormatFilter = false
}) => {
  const errorStatusCode = 404;
  return !IS_MULTI_LIBRARY ? (
    <Layout children={children} showFormatFilter={showFormatFilter} />
  ) : (
    <Error statusCode={errorStatusCode} />
  );
};

export default SingleLibraryPage;
