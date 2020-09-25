import * as React from "react";
import ContextProvider from "../components/context/ContextProvider";
import getOrCreateStore from "../dataflow/getOrCreateStore";
import Head from "next/head";
import Error from "components/Error";
import { AppProps } from "dataflow/withAppProps";
import AuthModal from "auth/AuthModal";

/* Page without Header and Footer should wrap pages that should not have sitewide navigation */

const Page: React.FC<AppProps> = props => {
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
  const store = getOrCreateStore();

  return (
    <>
      <Head>
        {/* define the default title */}
        <title>{library.catalogName}</title>
      </Head>
      <ContextProvider library={library} store={store}>
        <AuthModal>{children}</AuthModal>
      </ContextProvider>
    </>
  );
};

export default Page;
