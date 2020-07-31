import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import useTypedSelector from "./useTypedSelector";
import { getErrorMsg } from "utils/book";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";

export default function useBorrow(book: BookData) {
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
  const { actions, dispatch } = useActions();

  const borrowOrReserve = async () => {
    if (book.borrowUrl) {
      setLoading(true);
      await dispatch(actions.updateBook(book.borrowUrl));
      if (!isUnmounted.current) setLoading(false);
    } else {
      throw Error("No borrow url present for book");
    }
  };

  React.useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return {
    isLoading,
    borrowOrReserve,
    errorMsg
  };
}
