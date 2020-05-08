import * as React from "react";
import { IS_MULTI_LIBRARY } from "../utils/env";
import NotFoundPage from "../pages/404";

const SingleLibraryPage: React.FC<{}> = ({ children }) => {
  return !IS_MULTI_LIBRARY ? <>{children}</> : <NotFoundPage />;
};

export default SingleLibraryPage;
