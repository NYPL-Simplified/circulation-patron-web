import { PathFor } from "opds-web-client/lib/interfaces";
import UrlShortener from "../UrlShortener";

const getPathFor = (
  urlShortener: UrlShortener,
  libraryId?: string
): PathFor => (collectionUrl, bookUrl) => {
  let path = "";
  if (libraryId) {
    path += "/" + libraryId;
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
