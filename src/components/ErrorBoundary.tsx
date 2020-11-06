/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BugsnagErrorBoundary } from "analytics/bugsnag";
import ErrorComponent from "components/Error";

export type FallbackProps = {
  error: Error;
  info: React.ErrorInfo;
  clearError: () => void;
};

export const DefaultFallback: React.FC<FallbackProps> = ({ error }) => {
  return (
    <ErrorComponent
      error={{
        title: `${error.name}`,
        detail:
          "Something went wrong. Please refresh and try again. If the issue persists, contact your library support staff."
      }}
    />
  );
};

type ErrorState = { error?: Error; info?: React.ErrorInfo };
const initialState: ErrorState = { error: undefined, info: undefined };
class DefaultErrorBoundary extends React.Component<
  {
    FallbackComponent: React.ComponentType<FallbackProps>;
  },
  ErrorState
> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state = initialState;

  handleClearError() {
    this.setState(initialState);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      info: errorInfo
    });
  }

  render() {
    const { error, info } = this.state;
    const { FallbackComponent } = this.props;

    if (error && info) {
      return (
        <FallbackComponent
          clearError={this.handleClearError}
          error={error}
          info={info}
        />
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary: React.FC<{
  fallback?: React.ComponentType<FallbackProps>;
}> = ({ children, fallback: Fallback = DefaultFallback }) => {
  if (!BugsnagErrorBoundary) {
    return (
      <DefaultErrorBoundary FallbackComponent={Fallback}>
        {children}
      </DefaultErrorBoundary>
    );
  }
  return (
    <BugsnagErrorBoundary FallbackComponent={Fallback}>
      {children}
    </BugsnagErrorBoundary>
  );
};

export default function withErrorBoundary<T>(
  Component: React.ComponentType<T>,
  Fallback: React.ComponentType<FallbackProps> = DefaultFallback
) {
  const Wrapped = (props: T) => {
    if (!BugsnagErrorBoundary) {
      return (
        <DefaultErrorBoundary FallbackComponent={Fallback}>
          <Component {...props} />
        </DefaultErrorBoundary>
      );
    }
    return (
      <BugsnagErrorBoundary FallbackComponent={Fallback}>
        <Component {...props} />
      </BugsnagErrorBoundary>
    );
  };

  // Format for display in DevTools
  const name = Component.displayName || Component.name;
  Wrapped.displayName = name
    ? `WithErrorBoundary(${name})`
    : "WithErrorBoundary";

  return Wrapped;
}
