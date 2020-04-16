import * as React from "react";
import OPDSRouterContextProvider, {
  RouterContext
} from "opds-web-client/lib/components/context/RouterContext";
import { Router as RouterType, Location } from "opds-web-client/lib/interfaces";
import { useHistory } from "react-router-dom";

export const RouterProvider: React.FC = ({ children }) => {
  const history = useHistory();

  const router: RouterType = {
    push: history.push,
    // we need to manipulate the createHref into the type
    // signature expected by history.createHref
    createHref: (location: string | Location) =>
      typeof location === "string"
        ? history.createHref({
            pathname: location
          })
        : history.createHref(location)
  };

  return (
    <OPDSRouterContextProvider router={router}>
      {children}
    </OPDSRouterContextProvider>
  );
};

export default RouterContext;
