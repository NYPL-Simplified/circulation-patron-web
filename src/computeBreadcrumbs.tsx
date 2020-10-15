import { CollectionData, LinkData } from "interfaces";

// Custom URL comparator to ignore trailing slashes.
const urlComparator = (
  url1: string | undefined,
  url2: string | undefined
): boolean => {
  if (url1?.endsWith("/")) {
    url1 = url1.slice(0, -1);
  }
  if (url2?.endsWith("/")) {
    url2 = url2.slice(0, -1);
  }
  return !!(url1 && url2) && url1 === url2;
};

const computeBreadcrumbs = (collection?: CollectionData): LinkData[] => {
  let links: LinkData[] = [];

  if (
    collection &&
    collection.raw &&
    collection.raw["simplified:breadcrumbs"] &&
    collection.raw["simplified:breadcrumbs"][0] &&
    collection.raw["simplified:breadcrumbs"][0].link
  ) {
    const rawLinks = collection.raw["simplified:breadcrumbs"][0].link;
    links = rawLinks.map((link: any) => {
      return {
        url: link["$"].href.value,
        text: link["$"].title.value
      };
    });
    links.push({
      url: collection.url,
      text: collection.title
    });
  } else {
    links = hierarchyComputeBreadcrumbs(collection, urlComparator);
  }

  return links;
};

export default computeBreadcrumbs;

/**
 * Computes breadcrumbs assuming that the OPDS feed is hierarchical - uses
 * the catalog root link, the parent of the current collection if it's not
 * the root, and the current collection. The OPDS spec doesn't require a
 * hierarchy, so this may not make sense for some feeds.
 * */
export function hierarchyComputeBreadcrumbs(
  collection?: CollectionData,
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
