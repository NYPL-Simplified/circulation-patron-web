import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "theme-ui";
import ContextProvider from "../components/context/ContextProvider";
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";
import library from "./fixtures/library";
import { LibraryData } from "interfaces";
import "./mockScrollTo";
import * as fixtures from "./fixtures";
import serializer from "jest-emotion";
import { MockNextRouterContextProvider } from "./mockNextRouter";
import { NextRouter } from "next/router";
import makeTheme from "../theme";
import { enableFetchMocks } from "jest-fetch-mock";
import setEnv from "./setEnv";

enableFetchMocks();
expect.addSnapshotSerializer(serializer);

export { fixtures, setEnv };

// configure the enzyme adapter
configure({ adapter: new Adapter() });

/**
 * mock out the window.URL.createObjectURL since it isn't
 * available on jsdom
 */
const mockCreateObjectURL = jest.fn();
(global as any)["URL"].createObjectURL = mockCreateObjectURL;

type CustomRenderOptions = Parameters<typeof render>[1] & {
  router?: Partial<NextRouter>;
  library?: LibraryData;
  colors?: { primary: string; secondary: string };
};
const customRender = (ui: any, options?: CustomRenderOptions) => {
  const theme = makeTheme({
    primary: "#337ab7",
    secondary: "#d9534f"
  });
  const AllTheProviders: React.FC = ({ children }) => {
    return (
      <MockNextRouterContextProvider router={options?.router}>
        <ThemeProvider theme={theme}>
          <ContextProvider library={options?.library ?? library}>
            {children}
          </ContextProvider>
        </ThemeProvider>
      </MockNextRouterContextProvider>
    );
  };

  return {
    ...render(ui, { wrapper: AllTheProviders, ...options })
  };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
