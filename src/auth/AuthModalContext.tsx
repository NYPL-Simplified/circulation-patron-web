import * as React from "react";

/**
 * This context just tracks whether we should be showing the auth modal at any given point.
 */

const AuthModalContext = React.createContext<
  { showModal: () => void; showModalAndReset: () => void } | undefined
>(undefined);

export const AuthModalProvider: React.FC<{
  showModal: () => void;
  showModalAndReset: () => void;
}> = ({ showModal, showModalAndReset, children }) => (
  <AuthModalContext.Provider value={{ showModal, showModalAndReset }}>
    {children}
  </AuthModalContext.Provider>
);

export default function useAuthModalContext() {
  const context = React.useContext(AuthModalContext);
  if (typeof context === "undefined") {
    throw new Error(
      "useAuthModalContext must be used within an AuthModalContextProvider"
    );
  }
  return context;
}
