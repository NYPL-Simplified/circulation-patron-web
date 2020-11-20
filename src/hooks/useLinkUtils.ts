import useLibraryContext from "components/context/LibraryContext";
import type { Url } from "components/Link";

const trailingSlashRegex = /\/$/;

export default function useLinkUtils() {
  const { slug, catalogUrl } = useLibraryContext();

  function buildMultiLibraryLink(href: Url): Url {
    const pathname = typeof href === "string" ? href : href.pathname;

    if (typeof href === "string") {
      const fullPathname = `/${slug}${pathname}`.replace(
        trailingSlashRegex,
        ""
      );
      return fullPathname;
    }
    // if we are dealing with a UrlObject, we specify the pathname without dynamic
    // properties, and pass those in the query to be filled in by Nextjs
    const fullPathname = `/[library]${pathname}`;
    return { pathname: fullPathname, query: href.query };
  }

  function buildCollectionLink(collectionUrl: string) {
    // if there is no collection url, or it is the catalog root, go home
    if (
      !collectionUrl ||
      collectionUrl.replace(trailingSlashRegex, "") === catalogUrl
    ) {
      return buildMultiLibraryLink("/");
    }
    return buildMultiLibraryLink(
      `/collection/${encodeURIComponent(collectionUrl)}`
    );
  }

  function buildBookLink(bookUrl: string) {
    return buildMultiLibraryLink(`/book/${encodeURIComponent(bookUrl)}`);
  }

  return {
    buildMultiLibraryLink,
    buildCollectionLink,
    buildBookLink
  };
}
