/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

type OnError = (error: Error, componentStack: string) => void;

type Props = {
  onError?: OnError;
  fallback: React.ComponentType<{ error: Error | null; message: string }>;
};

type ErrorInfo = {
  componentStack: string;
};

type State = {
  error: Error | null;
};

const DEFAULT_MESSAGE =
  "Something went wrong. Please refresh and try again. If the issue persists, contact your library support staff.";

export const DefaultFallback: React.FC<{
  error: Error | null;
  message: string;
}> = ({ error, message = DEFAULT_MESSAGE }) => {
  return (
    <div
      sx={{
        maxHeight: "100vh",
        maxWidth: "100vw",
        textAlign: "center",
        backgroundColor: "warn",
        color: "ui.white",
        cursor: "help",
        borderRadius: "card"
      }}
      title={error?.toString()}
    >
      <p>{message}</p>
    </div>
  );
};

export default class ErrorBoundary extends React.Component<Props, State> {
  static defaultProps = {
    fallback: DefaultFallback
  };

  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log("ERROR", error);
    const { onError } = this.props;
    console.error(error, info.componentStack);
    onError?.(error, info.componentStack);
  }

  render() {
    const { children, fallback: Fallback } = this.props;
    const { error } = this.state;

    if (error !== null) {
      return <Fallback error={error} message={DEFAULT_MESSAGE} />;
    }

    return children;
  }
}

export function withErrorBoundary<T>(
  Component: React.ComponentType<T>,
  Fallback?: React.ComponentType<{ error: Error | null; message: string }>,
  onError?: OnError
) {
  const Wrapped = (props: T) => (
    <ErrorBoundary fallback={Fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  // Format for display in DevTools
  const name = Component.displayName || Component.name;
  Wrapped.displayName = name
    ? `WithErrorBoundary(${name})`
    : "WithErrorBoundary";

  return Wrapped;
}
