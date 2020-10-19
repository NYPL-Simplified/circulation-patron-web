import * as React from "react";
import { LibraryData } from "interfaces";
import { LibraryProvider } from "./LibraryContext";
import { Provider as ReakitProvider } from "reakit";
import { ThemeProvider } from "theme-ui";
import makeTheme from "../../theme";
import { UserProvider } from "components/context/UserContext";
import AuthModal from "auth/AuthModal";
import { ConfigInterface, SWRConfig } from "swr";

type ProviderProps = {
  library: LibraryData;
};

const swrOptions: ConfigInterface = {
  // we don't generally need to revalidate our data very often
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  const theme = makeTheme(library.colors);

  return (
    <SWRConfig value={swrOptions}>
      <ThemeProvider theme={theme}>
        <ReakitProvider>
          <LibraryProvider library={library}>
            <UserProvider>
              <AuthModal>{children}</AuthModal>
            </UserProvider>
          </LibraryProvider>
        </ReakitProvider>
      </ThemeProvider>
    </SWRConfig>
  );
};

export default AppContextProvider;
