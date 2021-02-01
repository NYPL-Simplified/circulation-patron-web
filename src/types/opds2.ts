/* eslint-disable camelcase */
import { OPDS1 } from "interfaces";
/**
 * OPDS 2.0 DATA TYPES
 * Currently only used for support of a Library Regristry, which is
 * an OPDS 2 Feed of OPDS 2 Catalogs from which we extract the catalog root url
 *
 * This is a working document that still has more to fill in.
 */

export interface Collection<M extends AnyObject = AnyObject> {
  /**
   * Must comply with "application/opds+json", but that is
   * not necessarily marked as the type
   */
  metadata: M;
  links: Link[];
}
// a feed is a collection since it has metadata, links and sub collections.
export interface Feed<M extends AnyObject = AnyObject> extends Collection<M> {
  // sub collections of with roles "navigation", "publication", "group"
  navigation?: NavigationLink[];
  publications?: Publication[];
  groups?: Group[];
}
export interface NavigationLink extends Link {
  title: string;
}

type GroupMetadata = { title: string };
export interface Group extends Collection<GroupMetadata> {
  /**
   * For when a catalog has more than one collection of
   * navigation or publications. It contains an array of
   * Feeds
   *
   */
  groups: Feed<GroupMetadata>[];
}

type LibraryRegistryFeedMetadata = { adobe_vendor_id: string; title: string };
export interface LibraryRegistryFeed extends Feed<LibraryRegistryFeedMetadata> {
  links: Link[];
  /**
   * When you fetch a templated url from a LibraryRegistryFeed, you
   * get back another LibraryRegistryFeed, but with a single catalog
   * in an array. A generic LibraryRegistryFeed has a list of all catalogs
   */
  catalogs?: CatalogEntry[];
}

type CatalogEntryMetadata = {
  updated: string;
  description: string;
  id: string;
  title: string;
};
export interface CatalogEntry extends Feed<CatalogEntryMetadata> {
  /**
   * The CatalogEntry is a Feed which describes an OPDS Catalog (v1 or v2).
   * It contains a link to an AuthDocument, thus marking it the top level descriptor
   * for a library with an authentication boundary. The AuthDocument and CatalogRootLink
   * are nested within Links.
   *
   * Since there is no way in typescript to describe an array that must contain
   * certain elements, this just extends Feed.
   */
}

/**
 * Publications must either be:
 * a Readium Web Publication with no restrictions in terms of access
 * (no payment, no credentials required, no limitations whatsoever),
 * or an OPDS Publication
 */
export type Publication = ReadiumWebPub | OPDSPublication;

export interface ReadiumWebPub extends Collection {
  readingOrder: any[];
}
export interface OPDSPublication extends Collection {
  /**
   * An OPDS Publication is basically a ReadiumWebPub without
   * the requirement that it contain a readingOrder collection
   */
}

/**
 * Links
 */
export const AuthDocumentRelation = "http://opds-spec.org/auth/document";
export const CatalogLinkTemplateRelation =
  "http://librarysimplified.org/rel/registry/library";
export const CatalogRootRelation = "http://opds-spec.org/catalog";

export type AnyLinkRelation =
  | typeof CatalogLinkTemplateRelation
  | typeof CatalogRootRelation
  | typeof AuthDocumentRelation
  | "self"
  | "search"
  | "registry";

export const BaseDocumentMediaType = "application/opds+json";
export const AuthDocumentMediaType =
  "application/vnd.opds.authentication.v1.0+json";

export type AnyMediaType =
  | typeof BaseDocumentMediaType
  | typeof AuthDocumentMediaType
  | typeof OPDS1.BaseDocumentMediaType
  | "application/opensearchdescription+xml"
  | "application/opds+json;profile=https://librarysimplified.org/rel/profile/directory";

export interface Link<
  R extends string = AnyLinkRelation,
  T extends string = AnyMediaType
> {
  href: string;
  type: T;
  rel: R;
}

export interface CatalogTemplateLink
  extends Link<
    typeof CatalogLinkTemplateRelation,
    typeof BaseDocumentMediaType
  > {
  templated: true;
}

export interface AuthDocumentLink
  extends Link<typeof AuthDocumentRelation, typeof AuthDocumentMediaType> {}
export interface CatalogRootFeedLink
  extends Link<
    typeof CatalogRootRelation,
    typeof OPDS1.BaseDocumentMediaType
  > {}

/**
 * Utility types
 */
export type AnyObject = Record<string, unknown>;
