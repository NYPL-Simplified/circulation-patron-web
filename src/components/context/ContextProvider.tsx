import * as React from "react";
import { LibraryData } from "interfaces";
import { LibraryProvider } from "./LibraryContext";
import { Provider as ReakitProvider } from "reakit";
import { LinkUtilsProvider } from "./LinkUtilsContext";

type ProviderProps = {
  library: LibraryData;
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  return (
    <ReakitProvider>
      <LibraryProvider library={library}>
        <LinkUtilsProvider library={library}>{children}</LinkUtilsProvider>
      </LibraryProvider>
    </ReakitProvider>
  );
};

export default AppContextProvider;
