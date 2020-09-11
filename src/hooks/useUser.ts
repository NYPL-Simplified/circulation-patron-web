import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import useSWR from "swr";
import {
  clearCredentials,
  getCredentials,
  setAuthCredentials
} from "auth/credentials";
import { BookData, CollectionData } from "interfaces";
import { AppAuthMethod } from "interfaces";

type UserState = {
  loans: CollectionData["books"] | undefined;
  isValidating: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
  signIn: (token: string, method: AppAuthMethod) => void;
  signOut: () => void;
  // manually sets a book in the loans. For use after borrowing.
  setBook: (book: BookData) => void;
};

/**
 * This function just fetches the user from swr
 * tells you if you're authenticated or not.
 *
 * you can call it as many times as you want and your
 * fetches will be deduplicated!
 *
 * it will refetch the loans whenever the auth credentials change
 * also
 */
export default function useUser(): UserState {
  const { shelfUrl, slug } = useLibraryContext();
  const credentials = getCredentials(slug);
  const { data, mutate, error } = useSWR(
    [shelfUrl, credentials?.token, credentials?.methodType],
    fetchCollection,
    {
      // make this only not retry if the response is a 401
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000
    }
  );

  /**
   * The user is authenticated if there
   * was not an error on the response.
   */
  const isAuthenticated = !error;

  const isValidating = isAuthenticated && !data;

  function signIn(token: string, method: AppAuthMethod) {
    setAuthCredentials(slug, { token, methodType: method.type });
    // this will invalidate the cash, causing a re-fetch with the
    // new token
    mutate();
  }
  function signOut() {
    clearCredentials(slug);
    mutate();
  }

  function setBook(book: BookData) {
    if (data) {
      const newLoans: CollectionData = {
        ...data,
        books: [...data?.books, book]
      };
      mutate(newLoans, false);
    } else {
      // otherwise just refetch loans
      mutate();
    }
  }

  return {
    isAuthenticated,
    loans: isAuthenticated ? data?.books ?? [] : undefined,
    isValidating,
    refetch: mutate,
    signIn,
    signOut,
    setBook
  };
}
