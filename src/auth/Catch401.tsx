/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { keyInterface, SWRConfig } from "swr";
import swrConfig from "utils/swrConfig";
import { ServerError } from "errors";
import track from "analytics/track";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";

const CatchFetchErrors: React.FC = ({ children }) => {
  const router = useRouter();

  function handle401() {
    const currentUrl = router.asPath;
    const loginUrl = "/[library]/login";
    router.push({
      pathname: loginUrl,
      query: { ...router.query, [LOGIN_REDIRECT_QUERY_PARAM]: currentUrl }
    });
  }

  const config = {
    ...swrConfig,
    onError: (error: Error, _key: keyInterface) => {
      if (error instanceof ServerError) {
        if (error.info.status === 401) {
          handle401();
          return;
        }
      }
      // track the error to bugsnag
      track.error(error);
    }
  };

  return <SWRConfig value={config}>{children}</SWRConfig>;
};

export default CatchFetchErrors;
