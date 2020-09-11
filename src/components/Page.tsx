import * as React from "react";
import ContextProvider from "../components/context/ContextProvider";
import { ThemeProvider } from "theme-ui";
import Auth from "../auth/AuthForm";
import ErrorBoundary from "../components/ErrorBoundary";
import Head from "next/head";
import Error from "components/Error";
import makeTheme from "../theme";
import { AppProps } from "dataflow/withAppProps";
import Layout from "./Layout";
import { useRouter } from "next/router";
import { PageLoader } from "components/LoadingIndicator";

const Page: React.FC<AppProps> = props => {
  // render a loader
  const { isFallback } = useRouter();
  if (isFallback) return <PageLoader />;

  /**
   * If there was no library or initialState provided, render the error page
   */
  if (props.error || !props.library) {
    return (
      <Error
        statusCode={props.error?.statusCode}
        detail={props.error?.message}
        configFile={props.configFile}
      />
    );
  }

  const { library, children } = props;
  const theme = makeTheme(library.colors);

  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <Head>
        {/* define the default title */}
        <title>{library.catalogName}</title>
      </Head>
      <ContextProvider library={library}>
        <ThemeProvider theme={theme}>
          <Auth>
            <Layout>{children}</Layout>
          </Auth>
        </ThemeProvider>
      </ContextProvider>
    </ErrorBoundary>
  );
};

const AppErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div>
      <p sx={{ textAlign: "center" }}>{message}</p>
    </div>
  );
};

export default Page;
