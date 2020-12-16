import * as React from "react";
import { AppProps, NextWebVitalsMetric } from "next/app";
import { IS_SERVER, IS_DEVELOPMENT, REACT_AXE } from "../utils/env";
import { ErrorBoundary } from "components/ErrorBoundary";
import enableAxe from "utils/axe";
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

if (IS_DEVELOPMENT && !IS_SERVER && REACT_AXE) {
  enableAxe();
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  track.webVitals(metric);
}

export default MyApp;
