import { PathFor } from "opds-web-client/lib/interfaces";
import UrlShortener from "../UrlShortener";

const getPathFor = (
  urlShortener: UrlShortener,
  librarySlug: string | null
): PathFor => (collectionUrl, bookUrl) => {
  let path = "";
  if (librarySlug) {
    path += "/" + librarySlug;
  }
  if (collectionUrl) {
    const preparedCollectionUrl = urlShortener.prepareCollectionUrl(
      collectionUrl
    );
    if (preparedCollectionUrl) {
      path += `/collection/${preparedCollectionUrl}`;
    }
  }
  if (bookUrl) {
    path += `/book/${urlShortener.prepareBookUrl(bookUrl)}`;
  }
  if (!path) {
    path = "/";
  }
  return path;
};

export default getPathFor;
