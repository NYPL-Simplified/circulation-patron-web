import {
  createCollectionUrl,
  fetchFeed,
  stripUndefined
} from "dataflow/opds1/fetch";
import { feedToCollection } from "dataflow/opds1/parse";
import extractParam from "dataflow/utils";
import withAppProps from "dataflow/withAppProps";
import { GetStaticProps } from "next";

const getStaticCollection: GetStaticProps = withAppProps(
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
export default getStaticCollection;
