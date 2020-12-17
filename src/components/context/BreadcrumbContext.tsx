import * as React from "react";
import { LinkData } from "../../interfaces";

export type BreadcrumbContextType =
  | {
      storedBreadcrumbs: LinkData[];
      setStoredBreadcrumbs: (storedBreadcrumbs: LinkData[]) => void;
    }
  | undefined;

const BreadcrumbContext = React.createContext<BreadcrumbContextType>(undefined);

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
