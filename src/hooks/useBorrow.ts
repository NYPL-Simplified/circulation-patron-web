import * as React from "react";
import { fetchBook } from "dataflow/opds1/fetch";
import useUser from "components/context/UserContext";
import useLibraryContext from "components/context/LibraryContext";
import useAuthModalContext from "auth/AuthModalContext";
import useError from "hooks/useError";

export default function useBorrow(isBorrow: boolean) {
  const { catalogUrl } = useLibraryContext();
  const { setBook, token } = useUser();
  const { showModal } = useAuthModalContext();
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const { error, handleError, setErrorString, clearError } = useError();

  const loadingText = isBorrow ? "Borrowing..." : "Reserving...";
  const buttonLabel = isBorrow ? "Borrow" : "Reserve";

  const borrowOrReserve = async (url: string) => {
    setLoading(true);
    clearError();
    if (!token) {
      // TODO: register a callback to call if the sign in works
      showModal();
      setErrorString("You must be signed in to borrow this book.");
      setLoading(false);
      return;
    }
    try {
      const book = await fetchBook(url, catalogUrl, token);
      setBook(book);
    } catch (e) {
      handleError(e);
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
