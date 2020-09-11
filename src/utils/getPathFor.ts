import { PathFor } from "opds-web-client/lib/interfaces";
import encodeUrlParam from "utils/url";

const getPathFor = (librarySlug: string | null): PathFor => (
  collectionUrl?: string | null,
  bookUrl?: string | null
) => {
  let path = "";
  if (librarySlug) {
    path += "/" + librarySlug;
  }
  if (collectionUrl) {
    const preparedCollectionUrl = encodeUrlParam(collectionUrl);
    if (preparedCollectionUrl) {
      path += `/collection/${preparedCollectionUrl}`;
    }
  }
  if (bookUrl) {
    path += `/book/${encodeUrlParam(bookUrl)}`;
  }
  if (!path) {
    path = "/";
  }
  return path;
};

export default getPathFor;
