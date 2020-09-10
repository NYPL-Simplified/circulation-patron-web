import * as React from "react";
import Collection from "components/Collection";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Page from "components/Page";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { CollectionData } from "opds-web-client/lib/interfaces";
import {
  createCollectionUrl,
  fetchFeed,
  stripUndefined
} from "dataflow/opds1/fetch";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { feedToCollection } from "dataflow/opds1/parse";

const LibraryHome: NextPage<AppProps & { collection: CollectionData }> = ({
  library,
  error,
  collection
}) => {
  const { isFallback } = useRouter();
  if (isFallback) return "loading...";
  return (
    <Page library={library} error={error}>
      <Collection
        collection={collection}
        title={`${library?.catalogName} Home`}
      />
    </Page>
  );
};

export const getStaticProps: GetStaticProps = withAppProps(
  async ({ params }, { library }) => {
    // get the collection url
    // fetch the data
    // parse the data from XML to JS
    // return props
    const collectionUrl = extractParam(params, "collectionUrl");
    const fullCollectionUrl = createCollectionUrl(
      library.catalogUrl,
      collectionUrl
    );
    console.log("Running getStaticProps with ", fullCollectionUrl);
    const feed = await fetchFeed(fullCollectionUrl);
    const collection = feedToCollection(feed, fullCollectionUrl);
    const withoutUndefined = stripUndefined(collection);
    return {
      props: {
        collection: withoutUndefined
      },
      revalidate: 5
    };
  }
);

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

const extractParam = (
  query: ParsedUrlQuery | undefined,
  param: string
): string | undefined => {
  return typeof query?.[param] === "string" ? param : undefined;
};

export default LibraryHome;
