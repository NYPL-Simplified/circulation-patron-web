import * as React from "react";
import useTypedSelector from "./useTypedSelector";
import { getErrorMsg } from "utils/book";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { BookData, FulfillmentLink } from "opds-web-client/lib/interfaces";

export default function useBorrow(
  book: BookData,
  isBorrow: boolean,
  borrowLink: FulfillmentLink
) {
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const bookError = useTypedSelector(state => state.book?.error);
  const errorStr = getErrorMsg(bookError);
  const errorMsg =
    book.url && bookError && bookError.url.startsWith(book.url)
      ? errorStr
      : undefined;
  const { actions, dispatch } = useActions();
  const loadingText = isBorrow ? "Borrowing..." : "Reserving...";
  const buttonLabel = isBorrow
    ? borrowLink.indirectType ===
      "application/vnd.librarysimplified.axisnow+json"
      ? "Borrow to read online"
      : "Borrow to read on a mobile device"
    : "Reserve";

  const borrowOrReserve = async (url: string) => {
    setLoading(true);
    await dispatch(actions.updateBook(url));
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
    errorMsg
  };
}
