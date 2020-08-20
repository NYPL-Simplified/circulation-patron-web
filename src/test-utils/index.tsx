import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "theme-ui";
import ContextProvider from "../components/context/ContextProvider";
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";
import library from "./fixtures/library";
import BasicAuthPlugin from "../auth/basicAuthPlugin";
import buildStore from "opds-web-client/lib/store";
import { State } from "opds-web-client/lib/state";
import { LibraryData } from "../interfaces";
import "./mockScrollTo";
import * as fixtures from "./fixtures";
import ActionsCreator from "opds-web-client/lib/actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
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
global["URL"].createObjectURL = mockCreateObjectURL;

/**
 * We create the actions and fetcher here so that they can
 * be imported by our test file and spied on using:
 * jest.spyOn(actions, "fetchSearchDescription")
 * and then asserted against
 */
export const fetcher = new DataFetcher({ adapter });
export const actions = new ActionsCreator(fetcher);

type CustomRenderOptions = Parameters<typeof render>[1] & {
  router?: Partial<NextRouter>;
  initialState?: State;
  library?: LibraryData;
  colors?: { primary: string; secondary: string };
};
const customRender = (ui: any, options?: CustomRenderOptions) => {
  const pathFor = jest
    .fn()
    .mockImplementation((collectionUrl?: string, bookUrl?: string) =>
      `/${collectionUrl}` + bookUrl ? `/${bookUrl}` : ""
    );

  const store = buildStore(options?.initialState, [BasicAuthPlugin], pathFor);

  // spy on dispatch by default
  const origDispatch = store.dispatch;
  const mockDispatch: jest.Mock<typeof origDispatch> = jest
    .fn()
    .mockImplementation(origDispatch);
  store.dispatch = mockDispatch as typeof origDispatch;

  const theme = makeTheme({
    primary: "#337ab7",
    secondary: "#d9534f"
  });
  const AllTheProviders = ({ children }) => {
    return (
      <MockNextRouterContextProvider router={options?.router}>
        <ThemeProvider theme={theme}>
          <ContextProvider
            library={options?.library ?? library}
            store={store}
            fetcher={fetcher}
            actions={actions}
          >
            {children}
          </ContextProvider>
        </ThemeProvider>
      </MockNextRouterContextProvider>
    );
  };

  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    // we pass our mocks along so they can be used in assertions
    store,
    dispatch: mockDispatch
  };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
