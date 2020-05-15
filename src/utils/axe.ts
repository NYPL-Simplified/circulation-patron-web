import * as React from "react";

/**
 * Accessibility tool - outputs to devtools console on dev only and client-side only.
 * @see https://github.com/dequelabs/react-axe
 */
export default async function enableAxe() {
  const ReactDOM = await import("react-dom");
  const axe = await import("react-axe");
  axe(React, ReactDOM, 1000);
}
