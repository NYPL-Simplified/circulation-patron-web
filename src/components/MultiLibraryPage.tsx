import * as React from "react";
import { IS_MULTI_LIBRARY } from "../utils/env";
import NotFoundPage from "../pages/404";

const MultiLibraryPage: React.FC<{}> = ({ children }) => {
  const errorStatusCode = 404;
  return IS_MULTI_LIBRARY ? <>{children}</> : <NotFoundPage />;
};

export default MultiLibraryPage;
