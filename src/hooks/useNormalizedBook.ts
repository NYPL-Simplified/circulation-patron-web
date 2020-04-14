import { loanedBookData } from "opds-web-client/lib/utils";
import useTypedSelector from "./useTypedSelector";

/**
 * A hook to give you the book state that has been updated with
 * loan data if any exists
 */

export default function useNormalizedBook() {
  const book = useTypedSelector(state => state.book.data);
  const loans = useTypedSelector(state => state.loans.books);

  if (!book) return book;

  const bookWithLoanInfo = loanedBookData(book, loans);
  return bookWithLoanInfo;
}
