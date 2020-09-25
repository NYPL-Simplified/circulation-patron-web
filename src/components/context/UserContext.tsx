import useCredentials from "auth/useCredentials";
import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import { ServerError } from "errors";
import { AppAuthMethod, BookData } from "interfaces";
import * as React from "react";
import useSWR from "swr";

type Status = "authenticated" | "loading" | "unauthenticated";
type UserState = {
  loans: BookData[] | undefined;
  status: Status;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchLoans: () => void;
  signIn: (token: string, method: AppAuthMethod) => void;
  signOut: () => void;
  setBook: (book: BookData) => void;
  error: any;
  token?: string;
};

const UserContext = React.createContext<UserState | undefined>(undefined);

/**
 * Here we fetch the loans and provide functions to sign in
 * and sign out. Calling mutate() will invalidate the SWR
 * cache and therefore cause a refetch. The key to the cache
 * includes the shelfUrl, token and auth method type, so if any of
 * those change it will cause a refetch.
 */
export const UserProvider: React.FC = ({ children }) => {
  const { shelfUrl, slug } = useLibraryContext();
  const { credentials, setCredentials, clearCredentials } = useCredentials(
    slug
  );
  const { data, mutate, isValidating, error } = useSWR(
    // pass null if there are no credentials to tell SWR not to fetch at all.
    credentials
      ? [shelfUrl, credentials?.token, credentials?.methodType]
      : null,
    fetchLoans,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // clear credentials whenever we receive a 401
      onError: err => {
        if (err instanceof ServerError && err?.status === 401) {
          // clearCredentials();
        }
      }
    }
  );

  function signIn(token: string, method: AppAuthMethod) {
    setCredentials({ token, methodType: method.type });
    mutate();
  }
  function signOut() {
    clearCredentials();
    mutate();
  }

  function setBook(book: BookData) {
    const existing = data ?? [];
    const newData: BookData[] = [...existing, book];
    mutate(newData);
  }

  /**
   * We should only ever be in one of these three states.
   */
  const status: Status =
    data && credentials
      ? "authenticated"
      : credentials && isValidating
      ? "loading"
      : "unauthenticated";

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = {
    status,
    isAuthenticated,
    isLoading,
    loans: isAuthenticated ? data ?? [] : undefined,
    refetchLoans: mutate,
    signIn,
    signOut,
    setBook,
    error,
    token: credentials?.token
  };
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default function useUser() {
  const context = React.useContext(UserContext);
  if (typeof context === "undefined") {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// we only need the books out of a collection for loans,
// so this is a utility to extract those.
async function fetchLoans(url: string, token: string) {
  const collection = await fetchCollection(url, token);
  return collection.books;
}
