/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { PageLoader } from "../components/LoadingIndicator";
import { ListView, LanesView } from "./BookList";
import Head from "next/head";
import PageTitle from "./PageTitle";
import { Text } from "./Text";
import BreadcrumbBar from "./BreadcrumbBar";
import { CollectionData } from "opds-web-client/lib/interfaces";

/**
 * To Do:
 *  - pagination
 *  - fetching
 *  - if collection not passed in
 *  - fetch loans and normalize with loan data
 */
export const Collection: React.FC<{
  collection: CollectionData;
  title?: string;
}> = ({ collection, title }) => {
  const isFetching = useTypedSelector(state => state.collection.isFetching);
  // const collectionData = useNormalizedCollection();

  const hasLanes = collection?.lanes && collection.lanes.length > 0;
  const hasBooks = collection?.books && collection.books.length > 0;

  const pageTitle = title ?? `Collection: ${collection.title ?? ""}`;

  return (
    <div
      sx={{
        bg: "ui.gray.lightWarm",
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <BreadcrumbBar />
      <PageTitle>{pageTitle}</PageTitle>
      {isFetching ? (
        <PageLoader />
      ) : hasLanes ? (
        <LanesView lanes={collection.lanes ?? []} />
      ) : hasBooks ? (
        <ListView books={collection.books} />
      ) : (
        <div
          sx={{
            display: "flex",
            flex: "1 1 auto",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text variant="text.callouts.italic">This collection is empty.</Text>
        </div>
      )}
    </div>
  );
};

export default Collection;
