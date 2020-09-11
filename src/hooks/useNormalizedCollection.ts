import useUser from "hooks/useUser";
import { BookData, CollectionData } from "interfaces";

/**
 * A hook to give you the book state that has been updated with
 * loan data if any exists
 */
export default function useNormalizedCollection(collection: CollectionData) {
  const { loans } = useUser();

  return {
    ...collection,
    books: collection.books.map(book => loanedBookData(book, loans))
  };
}

export function loanedBookData(
  book: BookData,
  loans: BookData[] | undefined,
  bookUrl?: string
): BookData {
  if (!loans || loans.length === 0) {
    return book;
  }

  const loan = loans.find(loanedBook => {
    if (book) {
      return loanedBook.id === book.id;
    } else if (bookUrl) {
      return loanedBook.url === bookUrl;
    } else {
      return false;
    }
  });
  return loan || book;
}
