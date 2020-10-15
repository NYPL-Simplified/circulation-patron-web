import * as React from "react";
import { useRouter } from "next/router";
import * as env from "utils/env";
import track from "analytics/track";
import extractParam from "dataflow/utils";

const PageviewTracker: React.FC = ({ children }) => {
  const { asPath, pathname, query } = useRouter();
  const collectionUrl = extractParam(query, "collectionUrl");
  const bookUrl = extractParam(query, "bookUrl");
  const library = extractParam(query, "library");

  /**
   * We update the dataLayer whenever we change pages.
   */
  React.useEffect(() => {
    track.pageview({
      path: asPath,
      codePath: pathname,
      appEnvironment: env,
      library,
      collectionUrl,
      bookUrl
    });
  }, [collectionUrl, bookUrl, library, asPath, pathname]);

  return <>{children}</>;
};

export default PageviewTracker;
