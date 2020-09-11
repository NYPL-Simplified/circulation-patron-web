import useUser from "hooks/useUser";
import { BookData } from "interfaces";

/**
 * A hook to give you the book state that has been updated with
 * loan data if any exists
 */

export default function useNormalizedBook(
  book: BookData | undefined
): BookData | undefined {
  const { loans } = useUser();

  if (!book || !loans) return book;

  const loan = loans.find(loanedBook => book.id === loanedBook.id);

  return loan ?? book;
}
