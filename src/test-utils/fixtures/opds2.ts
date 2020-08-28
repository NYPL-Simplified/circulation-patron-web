/* eslint-disable camelcase */
import { OPDS2 } from "interfaces";
/**
 * An OPDS 2 Library Registry Feed
 */

const templateLink: OPDS2.CatalogTemplateLink = {
  templated: true,
  rel: "http://librarysimplified.org/rel/registry/library",
  type: "application/opds+json",
  href: "/catalog-template-url-{uuid}"
};

export const feedWithoutCatalog: OPDS2.LibraryRegistryFeed = {
  metadata: { title: "registry title", adobe_vendor_id: "vendor id" },
  links: [templateLink]
};

const authDocLink: OPDS2.AuthDocumentLink = {
  href: "/auth-doc",
  type: "application/vnd.opds.authentication.v1.0+json",
  rel: "http://opds-spec.org/auth/document"
};
const catalogRootFeedLink: OPDS2.CatalogRootFeedLink = {
  href: "/catalog-root-feed",
  type: "application/atom+xml;profile=opds-catalog;kind=acquisition",
  rel: "http://opds-spec.org/catalog"
};
export const catalogEntry: OPDS2.CatalogEntry = {
  metadata: {
    updated: "catalog updated",
    description: "catalog entry description",
    id: "catalog entry id",
    title: "catalog entry title"
  },
  // it must have these two things. That's what defines a "Catalog"
  links: [authDocLink, catalogRootFeedLink]
};

export const feedWithCatalog: OPDS2.LibraryRegistryFeed = {
  metadata: { title: "registry title", adobe_vendor_id: "vendor id" },
  links: [],
  catalogs: [catalogEntry]
};
