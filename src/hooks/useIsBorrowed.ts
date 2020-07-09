import { BookData } from "opds-web-client/lib/interfaces";
import useTypedSelector from "./useTypedSelector";

/**
 * Will return whether a book is borrowed or not
 */

export default function useIsBorrowed(book: BookData) {
  const loans = useTypedSelector(state => state.loans.books);

  // does it exist in loans?
  const loan = loans.find(loanedBook => loanedBook.id === book.id);

  if (loan) return true;
  return false;
}
