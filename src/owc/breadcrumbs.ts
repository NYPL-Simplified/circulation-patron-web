import { CollectionData, LinkData } from "interfaces";

/**
 * Computes breadcrumbs assuming that the OPDS feed is hierarchical - uses
 * the catalog root link, the parent of the current collection if it's not
 * the root, and the current collection. The OPDS spec doesn't require a
 * hierarchy, so this may not make sense for some feeds.
 * */
export function hierarchyComputeBreadcrumbs(
  collection: CollectionData,
  history: LinkData[],
  comparator?: (url1: string, url2: string) => boolean
): LinkData[] {
  const links: LinkData[] = [];

  if (!collection) {
    return [];
  }

  if (!comparator) {
    comparator = (url1, url2) => url1 === url2;
  }

  const { catalogRootLink, parentLink } = collection;

  if (catalogRootLink && !comparator(catalogRootLink.url, collection.url)) {
    links.push({
      text: catalogRootLink.text || "Catalog",
      url: catalogRootLink.url
    });
  }

  if (
    parentLink &&
    parentLink.url &&
    parentLink.text &&
    (!catalogRootLink || !comparator(parentLink.url, catalogRootLink.url)) &&
    !comparator(parentLink.url, collection.url)
  ) {
    links.push({
      text: parentLink.text,
      url: parentLink.url
    });
  }

  links.push({
    url: collection.url,
    text: collection.title
  });

  return links;
}
