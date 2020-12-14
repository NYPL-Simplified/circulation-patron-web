import * as React from "react";
import { LinkData } from "../../interfaces";

export type BreadcrumbContextType = {
  breadcrumbx: Array<LinkData> | undefined;
  setBreadcrumbx: (breadcrumbx: Array<LinkData>) => void;
};

const BreadcrumbContext = React.createContext<BreadcrumbContextType>(undefined);

export const BreadcrumbProvider: React.FC = ({ children }) => {
  const [breadcrumbx, setBreadcrumbx] = React.useState();
  return (
    <BreadcrumbContext.Provider value={{ breadcrumbx, setBreadcrumbx }}>
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
