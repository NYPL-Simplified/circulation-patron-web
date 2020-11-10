import Bugsnag from "@bugsnag/js";
import ApplicationError, { ServerError } from "errors";
/* eslint-disable camelcase */
import { NextWebVitalsMetric } from "next/app";
import { APP_CONFIG } from "utils/env";

type PageData = {
  path: string;
  codePath: string;
  appEnvironment: Record<string, unknown>;
  library?: string;
  collectionUrl?: string;
  bookUrl?: string;
};
// doesn't track an event, just updates the data layer for the page
function pageview(page: PageData) {
  window?.dataLayer?.push({
    event: "pageview",
    page: {
      ...page,
      // clear out the collection/book url and library on each page view if it isn't present
      // in the new page view
      library: page.library ?? undefined,
      collectionUrl: page.collectionUrl ?? undefined,
      bookUrl: page.bookUrl ?? undefined
    }
  });
}

async function sendServerEvent(url: string | null) {
  if (url) {
    try {
      await fetch(url, { method: "POST" });
      return true;
    } catch (e) {
      console.warn("Error tracking server event");
      console.warn(e);
    }
  }
  return true;
}

async function openBook(url: string | null) {
  return sendServerEvent(url);
}

// allows us to track performance using web vitals reports
// https://nextjs.org/docs/advanced-features/measuring-performance
function webVitals({ id, name, value, label }: NextWebVitalsMetric) {
  window.dataLayer?.push("performance_metric_recorded", {
    metric_name: name,
    metric_category:
      label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    metric_value: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    metric_id: id // id unique to current page load
  });
}

function error(
  e: Error,
  {
    severity,
    metadata
  }: {
    severity?: "info" | "warning" | "error";
    metadata?: Record<string, Record<any, unknown>>;
  } = {}
) {
  // report it to the console
  console.error(e);
  // track to bugsnag
  if (APP_CONFIG.bugsnagApiKey) {
    Bugsnag.notify(e, event => {
      // set severity
      if (severity) event.severity = severity;

      // add custom metadata
      if (metadata) {
        const keys = Object.keys(metadata);
        keys.forEach(key => event.addMetadata(key, metadata[key]));
      }
      // add error info if there is any
      if (e instanceof ApplicationError) {
        event.addMetadata("Error Info", e.info);
        if (e instanceof ServerError) {
          event.addMetadata("Error Info", {
            url: e.url,
            authDocument: e.authDocument
          });
        }
      }
    });
  }
}

export default {
  error,
  webVitals,
  pageview,
  openBook
};
