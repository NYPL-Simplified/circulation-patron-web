import * as React from "react"
import Router from "next/router";
import { RouterContext } from "next/dist/next-server/lib/router-context";

const mockPush = (...args) => console.log("Mock Push", ...args)
Router.push = mockPush as any;

export function nextRouterDecorator(Story: any, { parameters }){
  const { router = {} } = parameters;
  const {
    basePath = "",
    route = "",
    pathname = "",
    query = {},
    asPath = "",
    push = mockPush as any,
    replace = (...args) => console.log("replace", ...args) as any,
    reload = (...args) => console.log("reload", ...args) as any,
    back = (...args) => console.log("back", ...args),
    prefetch = async (...args) => console.log("prefetch", ...args),
    beforePopState = (...args) => console.log("beforePopState", ...args),
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
        basePath,
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
      <Story />
    </RouterContext.Provider>
  );
  };

  export default Router;