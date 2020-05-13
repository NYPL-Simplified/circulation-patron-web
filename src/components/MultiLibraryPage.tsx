import * as React from "react";
import { IS_MULTI_LIBRARY } from "../utils/env";
import ErrorPage from "../pages/404";
import { useRouter } from "next/router";

const MultiLibraryPage: React.FC<{}> = ({ children }) => {
  const router = useRouter();
  React.useEffect(() => {
    if (!IS_MULTI_LIBRARY) {
      if (router.asPath !== "/404") {
        router.push("/404", router.asPath);
      }
    }
  });

  return IS_MULTI_LIBRARY ? <>{children}</> : <ErrorPage />;
};

export default MultiLibraryPage;
