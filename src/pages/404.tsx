import * as React from "react";
import ErrorComponent from "../components/Error";

export default function NotFoundPage() {
  return (
    <ErrorComponent
      error={{
        status: 404,
        title: "Page Not Found",
        detail: "The requested url is not available."
      }}
    />
  );
}
