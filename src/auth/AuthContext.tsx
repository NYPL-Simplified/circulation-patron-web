import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import { createCollectionUrl, fetchCollection } from "dataflow/opds1/fetch";
import useSWR from "swr";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { useAuthCredentials } from "auth/credentials";

type Authenticated = {
  loans: CollectionData;
  mutate: () => void;
  isAuthenticated: true;
};
type Unauthenticated = { isAuthenticated: false };

const AuthContext = React.createContext<
  undefined | Authenticated | Unauthenticated
>(undefined);
/**
 * Fetch auth, pass it down in context along with a function to mutate it
 */
export const Auth: React.FC = ({ children }) => {
  const { catalogUrl, slug } = useLibraryContext();
  const loansUrl = createCollectionUrl(catalogUrl, "loans");

  const credentials = useAuthCredentials(slug);

  const { data: loans, error, isValidating, mutate } = useSWR(
    [loansUrl, credentials],
    fetchCollection
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated: false }}>
      {children}
    </AuthContext.Provider>
  );
};
