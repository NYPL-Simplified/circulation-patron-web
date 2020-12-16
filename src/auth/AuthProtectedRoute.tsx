import useLogin from "auth/useLogin";
import useUser from "components/context/UserContext";
import { PageLoader } from "components/LoadingIndicator";
import React from "react";

/**
 * This will show a message and redirect the user to the login
 * page if they try to access a route they are not permitted to see.
 */
const AuthProtectedRoute: React.FC = ({ children }) => {
  const { isLoading, isAuthenticated, token, error } = useUser();
  const { initLogin } = useLogin();

  React.useEffect(() => {
    if (!token || error) {
      initLogin();
    }
  }, [initLogin, token, error]);

  if (isAuthenticated) {
    return <>{children}</>;
  }
  if (isLoading) {
    return <PageLoader />;
  }
  return <Unauthorized />;
};

export default AuthProtectedRoute;

const Unauthorized = () => {
  return (
    <div
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      <h4>You need to be signed in to view this page.</h4>
    </div>
  );
};
