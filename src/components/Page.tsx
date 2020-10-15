/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import ContextProvider from "../components/context/ContextProvider";
import Head from "next/head";
import Error from "components/Error";
import { AppProps } from "dataflow/withAppProps";
import { useRouter } from "next/router";
import { PageLoader } from "components/LoadingIndicator";

/* Page without Header and Footer should wrap pages that should not have sitewide navigation */

const Page: React.FC<AppProps> = props => {
  const { isFallback } = useRouter();
  /**
   * If we are in a static generation fallback, we have no
   * library information yet so render a loader.
   */
  if (isFallback) {
    return (
      <div
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh"
        }}
      >
        <PageLoader />
      </div>
    );
  }
  /**
   * If there was no library or initialState provided, render the error page
   */

  if (props.error || !props.library) {
    return (
      <Error
        statusCode={props.error?.statusCode}
        detail={props.error?.message}
      />
    );
  }

  const { library, children } = props;

  return (
    <>
      <Head>
        {/* define the default title */}
        <title>{library.catalogName}</title>
      </Head>
      <ContextProvider library={library}>{children}</ContextProvider>
    </>
  );
};

export default Page;
