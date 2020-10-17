/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { PageLoader } from "../components/LoadingIndicator";
import { InfiniteBookList, LanesView } from "./BookList";
import Head from "next/head";
import PageTitle from "./PageTitle";
import { Text } from "./Text";
import BreadcrumbBar from "./BreadcrumbBar";
import computeBreadcrumbs from "computeBreadcrumbs";
import useLibraryContext from "components/context/LibraryContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import extractParam from "dataflow/utils";
import { useRouter } from "next/router";
import useSWR from "swr";
import { cacheCollectionBooks } from "utils/cache";

export const Collection: React.FC<{
  title?: string;
}> = ({ title }) => {
  const { catalogUrl } = useLibraryContext();
  const { query } = useRouter();
  const collectionUrlParam = extractParam(query, "collectionUrl");
  // use catalog url if you're at home
  const collectionUrl = decodeURIComponent(collectionUrlParam ?? catalogUrl);

  const { data: collection, isValidating } = useSWR(
    collectionUrl,
    fetchCollection
  );

  // extract the books from the collection and set them in the SWR cache
  // so we don't have to refetch them when you click a book.
  React.useEffect(() => {
    cacheCollectionBooks(collection);
  }, [collection]);

  const isLoading = !collection && isValidating;

  const hasLanes = collection?.lanes && collection.lanes.length > 0;
  const hasBooks = collection?.books && collection.books.length > 0;
  const pageTitle = title ?? `Collection: ${collection?.title ?? ""}`;

  const breadcrumbs = computeBreadcrumbs(collection);
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
      <BreadcrumbBar breadcrumbs={breadcrumbs} />
      <PageTitle collection={collection}>{pageTitle}</PageTitle>
      {isLoading ? (
        <PageLoader />
      ) : hasLanes ? (
        <LanesView lanes={collection?.lanes ?? []} />
      ) : hasBooks ? (
        <InfiniteBookList firstPageUrl={collectionUrl} />
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
