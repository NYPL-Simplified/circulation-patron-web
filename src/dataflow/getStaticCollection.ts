import { fetchFeed, stripUndefined } from "dataflow/opds1/fetch";
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
    // if there is no collection url, use the catalog root.
    const url = collectionUrl ?? library.catalogUrl;
    console.log("Running getStaticProps with ", url);
    const feed = await fetchFeed(url);
    const collection = feedToCollection(feed, url);
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
