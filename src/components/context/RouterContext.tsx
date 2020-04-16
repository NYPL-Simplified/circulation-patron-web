import * as React from "react";
import OPDSRouterContextProvider, {
  RouterContext
} from "opds-web-client/lib/components/context/RouterContext";
import { Router as RouterType, Location } from "opds-web-client/lib/interfaces";
import { useHistory, matchPath, useLocation } from "react-router-dom";

export const RouterProvider: React.FC = ({ children }) => {
  const history = useHistory();
  const realLocation = useLocation();

  const router: RouterType = {
    push: history.push,
    // we need to manipulate the createHref into the type
    // signature expected by history.createHref
    createHref: (location: string | Location) =>
      typeof location === "string"
        ? history.createHref({
            pathname: location
          })
        : history.createHref(location),
    /**
     * recreating the deprecated isActive with the new
     * matchPath API
     */
    isActive: (location: string | Location) =>
      typeof location === "string"
        ? !!matchPath(realLocation.pathname, {
            path: location,
            exact: false,
            strict: false
          })
        : !!matchPath(realLocation.pathname, {
            path: location.pathname,
            exact: false,
            strict: false
          })
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
