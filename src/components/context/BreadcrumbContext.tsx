import * as React from "react";
import { LinkData } from "../../interfaces";

/**
 * Explanation / Background of this features:
 *
 * The server gives us breadcrumbs showing where a user is when it sends us
 * a collection (aka an OPDS Feed). It does not give us these breadcrumbs when
 * it sends us a book (aka an OPDS Entry), because a book can be part of many
 * different collections, so the server doesn't know what to send.
 *
 * We would like the user to be able to see their breadcrumbs when they click in
 * to view a book from a collection. We can do this because the front end knows
 * where the user is coming from, we just have to save the breadcrumbs from the
 * last viewed collection and then use them when showing a book. This context
 * is for saving those breadcrumbs.
 *
 */

export type BreadcrumbContextType =
  | {
      storedBreadcrumbs: LinkData[];
      setStoredBreadcrumbs: (storedBreadcrumbs: LinkData[]) => void;
    }
  | undefined;

export const BreadcrumbContext = React.createContext<BreadcrumbContextType>(
  undefined
);

export const BreadcrumbProvider: React.FC = ({ children }) => {
  const [storedBreadcrumbs, setStoredBreadcrumbs] = React.useState<LinkData[]>(
    []
  );

  return (
    <BreadcrumbContext.Provider
      value={{ storedBreadcrumbs, setStoredBreadcrumbs }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

export default function useBreadcrumbContext() {
  const context = React.useContext(BreadcrumbContext);
  if (typeof context === "undefined") {
    throw new Error(
      "useBreadcrumbContext must be used within a BreadcrumbContextProvider"
    );
  }
  return context;
}
