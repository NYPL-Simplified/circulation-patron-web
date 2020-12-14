import * as React from "react";
import { LibraryData } from "interfaces";
import { LibraryProvider } from "./LibraryContext";
import { Provider as ReakitProvider } from "reakit";
import { ThemeProvider } from "theme-ui";
import makeTheme from "../../theme";
import { UserProvider } from "components/context/UserContext";
import { BreadcrumbProvider } from "components/context/BreadcrumbContext";
import { SWRConfig } from "swr";
import swrConfig from "utils/swrConfig";
import CatchFetchErrors from "auth/Catch401";

type ProviderProps = {
  library: LibraryData;
};

/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  const theme = makeTheme(library.colors);

  return (
    <SWRConfig value={swrConfig}>
      <ThemeProvider theme={theme}>
        <ReakitProvider>
          <LibraryProvider library={library}>
            <UserProvider>
              <BreadcrumbProvider>
                <CatchFetchErrors>{children}</CatchFetchErrors>
              </BreadcrumbProvider>
            </UserProvider>
          </LibraryProvider>
        </ReakitProvider>
      </ThemeProvider>
    </SWRConfig>
  );
};

export default AppContextProvider;
