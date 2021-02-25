import * as React from "react";
import ReactDOM from "react-dom";
import { AppProps, NextWebVitalsMetric } from "next/app";
import { IS_SERVER, REACT_AXE } from "../utils/env";
import { ErrorBoundary } from "components/ErrorBoundary";
import "system-font-css";
import "@nypl/design-system-react-components/dist/styles.css";
import "css-overrides.css";
import track from "analytics/track";
import { BreadcrumbProvider } from "components/context/BreadcrumbContext";

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;
  return (
    <ErrorBoundary>
      <BreadcrumbProvider>
        <Component {...pageProps} />
      </BreadcrumbProvider>
    </ErrorBoundary>
  );
};

if (process.env.NODE_ENV === "development" && !IS_SERVER && REACT_AXE) {
  const axe = require("@axe-core/react");
  axe(React, ReactDOM, 1000, {});
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  track.webVitals(metric);
}

export default MyApp;
