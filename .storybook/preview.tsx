import * as React from "react";
import { ThemeProvider } from "theme-ui";
import { Provider as ReakitProvider } from "reakit";
import { LibraryProvider } from "../src/components/context/LibraryContext";
import { UserContext, UserState } from "../src/components/context/UserContext";
import { AuthModalProvider } from "../src/auth/AuthModalContext";
import makeTheme from "../src/theme";
import { libraryData } from "../src/test-utils/fixtures/library"
import { configDecorator } from "./config-mock";
import { swrDecorator } from "./swr-mock";
import { nextRouterDecorator } from "./next-router-mock";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const globalTypes = {
  showMedium: {
    name: "Medium",
    description: "Should the app show medium indicators?",
    defaultValue: true,
    toolbar: {
      // icon: "book",
      items: [
        { value: true, title: "Show" },
        { value: false, title: "Hide" }
      ]
    }
  },
  companionApp: {
    name: "Companion App",
    description: "Companion App",
    defaultValue: "simplye",
    toolbar: {
      items: [
        { value: "simplye", title: "SimplyE" },
        { value: "openebooks", title: "Open eBooks" }
      ]
    }
  }
};

export const user: UserState = {
  error: undefined,
  isAuthenticated: false,
  isLoading: false,
  loans: undefined,
  refetchLoans: () => console.log("refetch"),
  signIn: () => console.log("singIn"),
  signOut: () => console.log("signOut"),
  setBook:() => console.log("setBook"),
  status: "unauthenticated",
  clearCredentials: () => console.log("clearCredentials"),
  token: "user-token"
};

export const decorators = [
  nextRouterDecorator,
  swrDecorator,
  configDecorator,
  (Story: any, ctx: any) => {
    const theme = makeTheme(libraryData.colors);
    const library = libraryData;
    const showModal = () => console.log("show")
    return (
      <ThemeProvider theme={theme}>
        <ReakitProvider>
          <LibraryProvider library={library}>
            <UserContext.Provider value={user}>
              <AuthModalProvider
                showModal={showModal}
                showModalAndReset={showModal}
              >
                <Story />
              </AuthModalProvider>
            </UserContext.Provider>
          </LibraryProvider>
        </ReakitProvider>
      </ThemeProvider>
    )
  },
];