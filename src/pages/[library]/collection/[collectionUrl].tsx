import * as React from "react";
import Collection from "components/Collection";
import { NextPage, GetServerSideProps } from "next";
import Page from "components/Page";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import ApplicationError from "errors";
import OPDSParser, { OPDSFeed } from "opds-feed-parser";
import { feedToCollection } from "dataflow/OPDSDataAdapter";

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

function createCollectionUrl(
  catalogUrl: string,
  collectionUrl: string
): string {
  return `${catalogUrl}/${collectionUrl}`;
}

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
    try {
      // fetch the collection
      const response = await fetch(fullCollectionUrl);
      const text = await response.text();
      // check for an error code in the status
      if (!response.ok) {
        throw new ApplicationError(
          `Error fetching collection. Response text: ${text}`
        );
      }

      // parse the text into an opds feed
      const parser = new OPDSParser();
      const data = await parser.parse(text);
      if (!(data instanceof OPDSFeed)) {
        throw new ApplicationError("Fetch returned unexpected result");
      }
      const collection = feedToCollection(data, fullCollectionUrl);
      const withoutUndefined = stripUndefined(collection);
      return {
        props: {
          collection: withoutUndefined
        }
      };
    } catch (e) {
      throw new ApplicationError(
        "Could not fetch collection in getServerSideProps",
        e
      );
    }
  }
);

function stripUndefined(json: any) {
  return JSON.parse(JSON.stringify(json));
}

export default CollectionPage;
