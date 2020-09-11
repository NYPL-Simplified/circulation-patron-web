import useUser from "hooks/useUser";
import { BookData } from "interfaces";

/**
 * Will return whether a book is borrowed or not
 */

export default function useIsBorrowed(book: BookData) {
  const { loans } = useUser();

  // if there is no borrow url, there must not be any auth configured
  // in which case, we consider it "borrowed"
  if (!book.borrowUrl) return true;

  // if there are no loans, it can't be loaned
  if (!loans) return false;

  // does it exist in loans?
  const loan = loans.find(loanedBook => loanedBook.id === book.id);

  if (loan) return true;
  return false;
}
