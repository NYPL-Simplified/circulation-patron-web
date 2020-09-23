import * as React from "react";
import { AppProps } from "next/app";
import { IS_SERVER, IS_DEVELOPMENT, REACT_AXE } from "../utils/env";
import withErrorBoundary from "components/ErrorBoundary";
import enableAxe from "utils/axe";
import "system-font-css";
import "@nypl/design-system-react-components/dist/styles.css";
import "css-overrides.css";

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  const Wrapped = withErrorBoundary(Component);
  return <Wrapped {...pageProps} />;
};

if (IS_DEVELOPMENT && !IS_SERVER && REACT_AXE) {
  enableAxe();
}

export default MyApp;
