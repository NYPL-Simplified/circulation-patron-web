import { RouterContext } from "next/dist/next-server/lib/router-context";
import { NextRouter } from "next/router";

// Mocks useRouter
export const useRouterSpy = jest.spyOn(require("next/router"), "useRouter");

/**
 * mockNextUseRouter
 * Mocks the useRouter React hook from Next.js on a test-case by test-case basis
 */
export function mockNextUseRouter(router: Partial<NextRouter> = {}) {
  const {
    route = "",
    pathname = "",
    query = {},
    asPath = "",
    push = async () => true,
    replace = async () => true,
    reload = () => null,
    back = () => null,
    prefetch = async () => undefined,
    beforePopState = () => null,
    isFallback = false,
    events = {
      on: () => null,
      off: () => null,
      emit: () => null
    }
  } = router;
  useRouterSpy.mockImplementation(() => ({
    route,
    pathname,
    query,
    asPath,
    push,
    replace,
    reload,
    back,
    prefetch,
    beforePopState,
    isFallback,
    events
  }));
}

export const NextRouterContextProvider: React.FC<{
  router?: Partial<NextRouter>;
}> = ({ router = {}, children }) => {
  const {
    route = "",
    pathname = "",
    query = {},
    asPath = "",
    push = async () => true,
    replace = async () => true,
    reload = () => null,
    back = () => null,
    prefetch = async () => undefined,
    beforePopState = () => null,
    isFallback = false,
    events = {
      on: () => null,
      off: () => null,
      emit: () => null
    }
  } = router;
  return (
    <RouterContext.Provider
      value={{
        route,
        pathname,
        query,
        asPath,
        push,
        replace,
        reload,
        back,
        prefetch,
        beforePopState,
        isFallback,
        events
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};
