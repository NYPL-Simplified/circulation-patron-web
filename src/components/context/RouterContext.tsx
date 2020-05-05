import * as React from "react";
import OPDSRouterContextProvider, {
  RouterContext
} from "opds-web-client/lib/components/context/RouterContext";
import { Router as RouterType, Location } from "opds-web-client/lib/interfaces";
import { useRouter } from "next/router";

export const RouterProvider: React.FC = ({ children }) => {
  const nextRouter = useRouter();
  const router: RouterType = {
    push: nextRouter.push,
    // we need to manipulate the createHref into the type
    // signature expected by history.createHref
    createHref: (location: string | Location) =>
      typeof location === "string" ? location : location.pathname
  };
  // remove this once we update opds web
  const castChildren = children as React.ReactChild;

  return (
    <OPDSRouterContextProvider router={router}>
      {castChildren}
    </OPDSRouterContextProvider>
  );
};

export default RouterContext;
