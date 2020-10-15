import * as React from "react";
import { fetchBook } from "dataflow/opds1/fetch";
import useUser from "components/context/UserContext";
import useLibraryContext from "components/context/LibraryContext";
import { ServerError } from "errors";
import useAuthModalContext from "auth/AuthModalContext";

export default function useBorrow(isBorrow: boolean) {
  const { catalogUrl } = useLibraryContext();
  const { setBook, token } = useUser();
  const { showModal } = useAuthModalContext();
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const loadingText = isBorrow ? "Borrowing..." : "Reserving...";
  const buttonLabel = isBorrow ? "Borrow" : "Reserve";

  const borrowOrReserve = async (url: string) => {
    setLoading(true);
    setError(undefined);
    if (!token) {
      // TODO: register a callback to call if the sign in works
      showModal();
      setError("You must be signed in to borrow this book.");
      setLoading(false);
      return;
    }
    try {
      const book = await fetchBook(url, catalogUrl, token);
      setBook(book);
    } catch (e) {
      // TODO: Report error to bug catcher here.
      if (e instanceof ServerError) {
        console.log("ERR", e.info);
        setError(e.info.detail);
      } else {
        setError("An error occurred while borrowing this book.");
      }
    }

    if (!isUnmounted.current) setLoading(false);
  };

  React.useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve,
    error
  };
}
