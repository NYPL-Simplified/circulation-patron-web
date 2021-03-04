/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { keyInterface, SWRConfig } from "swr";
import swrConfig from "utils/swrConfig";
import { ServerError } from "errors";
import track from "analytics/track";
import useLogin from "auth/useLogin";
import useUser from "components/context/UserContext";
import { useRouter } from "next/router";

const CatchFetchErrors: React.FC = ({ children }) => {
  const { initLogin } = useLogin();
  const { isLoading } = useUser();
  const router = useRouter();

  function handle401() {
    const parsedHash = new URLSearchParams(
      window.location.hash.substr(1) // skip the first char (#)
    );
    const test = parsedHash.get("error");
    if (test) {
      const errorObject = JSON.parse(test);
      console.log(errorObject.detail);
      router.push(
        {
          query: { ...router.query, loginError: errorObject.detail }
        },
        undefined,
        {
          shallow: true
        }
      );
    }
    if (!isLoading) initLogin();
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
