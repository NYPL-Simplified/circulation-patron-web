/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { keyInterface, SWRConfig } from "swr";
import swrConfig from "utils/swrConfig";
import { ServerError } from "errors";
import track from "analytics/track";
import useLogin from "auth/useLogin";

const CatchFetchErrors: React.FC = ({ children }) => {
  const { initLogin } = useLogin();

  function handle401() {
    initLogin();
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
