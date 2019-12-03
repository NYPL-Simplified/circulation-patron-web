import { CollectionData, LinkData } from "opds-web-client/lib/interfaces";
import { hierarchyComputeBreadcrumbs } from "opds-web-client/lib/components/Breadcrumbs";

// Custom URL comparator to ignore trailing slashes.
let urlComparator = (url1: string, url2: string): boolean => {
  if (url1.endsWith("/")) {
    url1 = url1.slice(0, -1);
  }
  if (url2.endsWith("/")) {
    url2 = url2.slice(0, -1);
  }
  return url1 === url2;
};

export default (
  collection: CollectionData,
  history: LinkData[]
): LinkData[] => {
  let links = [];

  if (
    collection &&
    collection.raw &&
    collection.raw["simplified:breadcrumbs"] &&
    collection.raw["simplified:breadcrumbs"][0] &&
    collection.raw["simplified:breadcrumbs"][0].link
  ) {
    let rawLinks = collection.raw["simplified:breadcrumbs"][0].link;
    links = rawLinks.map(link => {
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
    links = hierarchyComputeBreadcrumbs(collection, history, urlComparator);
  }

  return links;
};
