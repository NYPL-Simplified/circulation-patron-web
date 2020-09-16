import { BookData } from "interfaces";
import ActionCreator from "../actions";

export interface LoansState {
  url: string | null;
  books: BookData[];
}

const initialState: LoansState = {
  url: null,
  books: []
};

export default (state: LoansState = initialState, action): LoansState => {
  switch (action.type) {
    case ActionCreator.COLLECTION_LOAD:
      const loansUrl = action.data.shelfUrl || state.url;
      const isLoans = action.url === loansUrl;

      return {
        ...state,
        url: action.data.shelfUrl || state.url,
        books: isLoans ? action.data.books : state.books
      };

    case ActionCreator.LOANS_LOAD:
      return { ...state, books: action.data.books };

    case ActionCreator.CLEAR_AUTH_CREDENTIALS:
      // Clear auth credentials should remove the authenticated
      // user's loans as well.
      return { ...state, books: [] };

    case ActionCreator.UPDATE_BOOK_LOAD:
      // A book has been updated, so the loans feed is now outdated.
      const updatedBook = action.data;
      const isReserved =
        updatedBook.availability &&
        updatedBook.availability.status === "reserved";
      const isBorrowed =
        updatedBook.fulfillmentLinks && updatedBook.fulfillmentLinks.length > 0;

      const newLoans: BookData[] = [];
      // Copy over all the books except the updated one.
      for (const loan of state.books) {
        if (loan.id !== updatedBook.id) {
          newLoans.push(loan);
        }
      }
      // If the updated book should be in the loans, add it.
      if (isReserved || isBorrowed) {
        newLoans.push(updatedBook);
      }

      return { ...state, books: newLoans };

    default:
      return state;
  }
};
