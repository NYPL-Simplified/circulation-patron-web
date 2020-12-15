import * as React from "react";
import { LinkData } from "../../interfaces";

export type BreadcrumbContextType = {
  breadcrumbs: Array<LinkData> | undefined;
  setBreadcrumbs: (breadcrumbs: Array<LinkData>) => void;
};

const BreadcrumbContext = React.createContext<BreadcrumbContextType>(undefined);

export const BreadcrumbProvider: React.FC = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = React.useState();
  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
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
