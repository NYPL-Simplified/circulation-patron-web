import { PathFor } from "opds-web-client/lib/interfaces";

const getPathFor = (librarySlug: string | null): PathFor => (
  collectionUrl?: string | null,
  bookUrl?: string | null
) => {
  let path = "";
  if (librarySlug) {
    path += "/" + librarySlug;
  }
  if (collectionUrl) {
    const preparedCollectionUrl = encodeURIComponent(collectionUrl);
    if (preparedCollectionUrl) {
      path += `/collection/${preparedCollectionUrl}`;
    }
  }
  if (bookUrl) {
    path += `/book/${encodeURIComponent(bookUrl)}`;
  }
  if (!path) {
    path = "/";
  }
  return path;
};

export default getPathFor;
