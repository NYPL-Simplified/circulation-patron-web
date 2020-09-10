import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import useSWR from "swr";
import {
  clearCredentials,
  getCredentials,
  setAuthCredentials
} from "auth/credentials";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { AppAuthMethod } from "interfaces";

type UserState = {
  loans: CollectionData["books"] | undefined;
  isValidating: boolean;
  isAuthenticated: boolean;
  mutate: () => void;
  signIn: (token: string, method: AppAuthMethod) => void;
  signOut: () => void;
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

  const signIn = (token: string, method: AppAuthMethod) => {
    setAuthCredentials(slug, { token, methodType: method.type });
    // this will invalidate the cash, causing a re-fetch with the
    // new token
    mutate();
  };
  const signOut = () => {
    clearCredentials(slug);
    mutate();
  };

  return {
    isAuthenticated,
    loans: isAuthenticated ? data?.books ?? [] : undefined,
    isValidating,
    mutate,
    signIn,
    signOut
  };
}
