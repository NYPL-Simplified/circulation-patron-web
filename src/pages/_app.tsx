import * as React from "react";
import { AppProps, NextWebVitalsMetric } from "next/app";
import { IS_SERVER, REACT_AXE } from "../utils/env";
import withErrorBoundary from "components/ErrorBoundary";
import "system-font-css";
import "@nypl/design-system-react-components/dist/styles.css";
import "css-overrides.css";
import track from "analytics/track";

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;
  const Wrapped = withErrorBoundary(Component);
  return <Wrapped {...pageProps} />;
};

if (process.env.NODE_ENV === "development" && !IS_SERVER && REACT_AXE) {
  const ReactDOM = require("react-dom");
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000);
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  track.webVitals(metric);
}

export default MyApp;
