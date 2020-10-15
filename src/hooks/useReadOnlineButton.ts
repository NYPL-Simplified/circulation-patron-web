import track from "analytics/track";
import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import { ServerError } from "errors";
import useIsMounted from "hooks/useIsMounted";
import * as React from "react";
import { ReadExternalDetails } from "utils/fulfill";

export default function useReadOnlineButton(
  details: ReadExternalDetails,
  trackOpenBookUrl: string | null
) {
  const { catalogUrl } = useLibraryContext();
  const isMounted = useIsMounted();
  const { token } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<null | string>(null);

  function setLoadingIfMounted(state: boolean) {
    if (isMounted.current) setLoading(state);
  }
  async function open() {
    setLoading(true);
    setError(null);
    try {
      // the url may be behind indirection, so we fetch it with the
      // provided function
      const url = await details.getUrl(catalogUrl, token);
      // we are about to open the book, so send a track event
      track.openBook(trackOpenBookUrl);
      setLoadingIfMounted(false);
      window.open(url, "__blank");
    } catch (e) {
      setLoadingIfMounted(false);
      if (e instanceof ServerError) {
        setError(`Error: ${e.info.detail}`);
        return;
      }
      if (e instanceof Error) {
        setError(`Error: ${e.message}`);
        return;
      }
      console.error(e);
      setError("An unknown error occurred trying to open the book");
    }
  }

  return {
    open,
    loading,
    error
  };
}
