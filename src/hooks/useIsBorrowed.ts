import { BookData } from "opds-web-client/lib/interfaces";
import useTypedSelector from "./useTypedSelector";

/**
 * Will return whether a book is borrowed or not
 */

export default function useIsBorrowed(book: BookData) {
  const loans = useTypedSelector(state => state.loans.books);

  // if there is no borrow url, there must not be any auth configured
  // in which case, we consider it "borrowed"
  if (!book.borrowUrl) return true;

  // does it exist in loans?
  const loan = loans.find(loanedBook => loanedBook.id === book.id);

  if (loan) return true;
  return false;
}
