import * as React from "react";

/**
 * This context just tracks whether we should be showing the auth modal at any given point.
 */

const AuthModalContext = React.createContext<
  { showModal: () => void } | undefined
>(undefined);

export const AuthModalProvider: React.FC<{ showModal: () => void }> = ({
  showModal,
  children
}) => (
  <AuthModalContext.Provider value={{ showModal }}>
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
