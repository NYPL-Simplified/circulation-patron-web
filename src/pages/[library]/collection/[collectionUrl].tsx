import * as React from "react";
import Collection from "components/Collection";
import { NextPage, GetServerSideProps } from "next";
import Page from "components/Page";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { feedToCollection } from "dataflow/opds/parse";
import { fetchFeed, createCollectionUrl } from "dataflow/opds/fetch";

type PageProps = {
  collection: any;
};

const CollectionPage: NextPage<AppProps & PageProps> = ({
  library,
  error,
  collection
}) => {
  return (
    <Page library={library} error={error}>
      <Collection collection={collection} />
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = withAppProps(
  async ({ params }, { library }) => {
    // get the collection url
    // fetch the data
    // parse the data from XML to JS
    // return props
    const { collectionUrl } = params;
    const fullCollectionUrl = createCollectionUrl(
      library.catalogUrl,
      collectionUrl
    );
    console.log("Running getServerSideProps with ", fullCollectionUrl);
    const feed = await fetchFeed(fullCollectionUrl);
    const collection = feedToCollection(feed, fullCollectionUrl);
    const withoutUndefined = stripUndefined(collection);
    return {
      props: {
        collection: withoutUndefined
      }
    };
  }
);

function stripUndefined(json: any) {
  return JSON.parse(JSON.stringify(json));
}

export default CollectionPage;
