import * as React from 'react';
import useLibraryContext from 'components/context/LibraryContext';
import { fetchCollection } from 'dataflow/opds1/fetch';
import useSWR from 'swr';
import { useAuthCredentials } from 'auth/credentials';

/**
 * This function just fetches the user from swr
 * tells you if you're authenticated or not. 
 * 
 * you can call it as many times as you want and your
 * fetches will be deduplicated!
 */

export default function useUser() {
  const { shelfUrl, slug } = useLibraryContext();
  const credentials = useAuthCredentials(slug);
  const { data, isValidating, mutate } = useSWR([shelfUrl, credentials], fetchCollection);

  return {
    isAuthenticated: false,
    loans: null,
    isLoading: false
  }
}