import { usePathFor } from "opds-web-client/lib/components/context/PathForContext";
import useLibraryContext from "../components/context/LibraryContext";

/**
 * uses pathFor to construct the link to either
 * another collection or a book within the same
 * OPDS catalog. Hook version of CatalogLink in
 * opds-web-client.
 *
 * you can pass in a collectionUrl to the hook, which makes each call to
 * getCatalogLink use that url. Or you can not pass one in and it will use
 * the default unless you specify in the call to getCatalogLink
 */
export function useGetCatalogLink(collectionUrlOverride?: string | null) {
  const pathFor = usePathFor();
  const library = useLibraryContext();

  // use the context provided library by default
  let collectionUrl: string = library.catalogUrl;
  if (collectionUrlOverride) {
    collectionUrl = collectionUrlOverride;
  }

  function getCatalogLink(
    bookUrl?: string | null,
    collection: string | null = collectionUrl
  ) {
    return pathFor(collection, bookUrl);
  }

  return getCatalogLink;
}

/**
 * Similar to the above, but simply gets the collectionUrl for a
 * provided bookUrl.
 */
function useCatalogLink(
  bookUrl?: string | null,
  collectionUrlOverride?: string | null
) {
  const getCatalogLink = useGetCatalogLink(collectionUrlOverride);

  const location = getCatalogLink(bookUrl);

  return location;
}

export default useCatalogLink;
