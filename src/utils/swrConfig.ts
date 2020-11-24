import track from "analytics/track";
import { ServerError } from "errors";
import { ConfigInterface } from "swr";

const swrConfig: ConfigInterface<any, Error> = {
  // we don't generally need to revalidate our data very often
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
  onError: (err, key, config) => {
    let severity: "warning" | "info" | "error" = "warning";
    if (err instanceof ServerError) {
      if (err.info.status === 401 || err.info.status === 404) {
        severity = "info";
      }
    }
    track.error(err, {
      severity,
      metadata: {
        "Fetch Info": {
          key,
          config
        }
      }
    });
  },
  onErrorRetry: (error, key, config, revalidate, { retryCount = 0 }) => {
    if (error instanceof ServerError) {
      // Never retry on 404 or 401.
      if (error.info.status === 404) return;
      if (error.info.status === 401) return;
    }
    // Only retry up to 10 times.
    if (retryCount >= 10) return;

    // Retry after 5 seconds.
    setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 5000);
  }
};

export default swrConfig;
