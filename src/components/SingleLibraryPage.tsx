import * as React from "react";
import { IS_MULTI_LIBRARY } from "../utils/env";
import ErrorPage from "../pages/_error";

const SingleLibraryPage: React.FC<{}> = ({ children }) => {
  return !IS_MULTI_LIBRARY ? <>{children}</> : <ErrorPage statusCode={404} />;
};

export default SingleLibraryPage;
