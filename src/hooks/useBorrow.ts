import * as React from "react";
import { fetchBook } from "dataflow/opds1/fetch";
import useUser from "components/context/UserContext";
import useLibraryContext from "components/context/LibraryContext";
import useError from "hooks/useError";
import useLogin from "auth/useLogin";

export default function useBorrow(isBorrow: boolean) {
  const { catalogUrl } = useLibraryContext();
  const { setBook, token } = useUser();
  const { initLogin } = useLogin();
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const { error, handleError, setErrorString, clearError } = useError();

  const loadingText = isBorrow ? "Borrowing..." : "Reserving...";
  const buttonLabel = isBorrow ? "Borrow this book" : "Reserve this book";

  const borrowOrReserve = async (url: string) => {
    clearError();
    if (!token) {
      initLogin();
      setErrorString("You must be signed in to borrow this book.");
      return;
    }
    setLoading(true);
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
