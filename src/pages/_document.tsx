import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { GTMScript, GTMNoscript } from "analytics/GoogleTagManager";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <GTMScript />
        </Head>
        <body>
          <Main />
          <NextScript />
          <GTMNoscript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
