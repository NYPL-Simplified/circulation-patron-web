/* eslint-disable camelcase */
import { CollectionState } from "opds-web-client/lib/reducers/collection";
import {
  CollectionData,
  BookData,
  MediaType
} from "opds-web-client/lib/interfaces";

/**
 * OPDS 2.0 DATA TYPES
 * Currently only used for support of a Library Registry, which is
 * an OPDS 2 Feed of OPDS 2 Catalogs from which we extract the catalog root url
 */
export * as OPDS2 from "types/opds2";
/**
 * OPDS 1.x DATA TYPES
 */
import * as OPDS1 from "types/opds1";
export { OPDS1 };

/**
 * INTERNAL APP MODEL
 */

export interface ComplaintData {
  type: string;
  detail?: string;
}

export type AppConfigFile = {
  [library: string]: string | undefined;
};

export type BookFulfillmentState =
  | "AVAILABLE_OPEN_ACCESS"
  | "AVAILABLE_TO_BORROW"
  /**
   *  READY_TO_BORROW indicates the book was on hold and now should
   *  be borrowed before the hold expires, or else you lose your spot.
   */
  | "READY_TO_BORROW"
  | "AVAILABLE_TO_RESERVE"
  | "RESERVED"
  | "AVAILABLE_TO_ACCESS"
  | "FULFILLMENT_STATE_ERROR";

export type LibraryLinks = {
  helpWebsite?: OPDS1.Link;
  helpEmail?: OPDS1.Link;
  libraryWebsite?: OPDS1.Link;
  tos?: OPDS1.Link;
  about?: OPDS1.Link;
  privacyPolicy?: OPDS1.Link;
  registration?: OPDS1.Link;
};

/**
 * The server representation has multiple IDPs nested into the one.
 * We will flatten that out before placing into LibraryData.
 */
export interface ClientSamlMethod extends OPDS1.AuthMethod {
  href: string;
}

export type AppAuthMethod =
  | OPDS1.AuthMethod
  | OPDS1.BasicAuthMethod
  | ClientSamlMethod;

export interface AuthCredentials {
  method: AppAuthMethod;
  token: string;
}

export interface LibraryData {
  slug: string | null;
  catalogUrl: string;
  shelfUrl: string | null;
  catalogName: string;
  logoUrl: string | null;
  colors: {
    primary: string;
    secondary: string;
  } | null;
  headerLinks: OPDS1.Link[];
  libraryLinks: LibraryLinks;
  authMethods: AppAuthMethod[];
}

/**
 * Recommendations and Complaints
 */
export type RecommendationsState = CollectionState;
export type { ComplaintsState } from "./hooks/useComplaints/reducer";

/**
 * Theme
 */
export type { AppTheme } from "theme";
// helper for theme variant prop types
export type VariantProp<VType> = Exclude<
  keyof VType,
  keyof Record<string, unknown>
>;

/**
 * Utils
 */
export type SetCollectionAndBook = (
  collectionUrl: string,
  bookUrl: string | undefined
) => Promise<{
  collectionData: CollectionData;
  bookData: BookData;
}>;

type PickAndRequire<T, K extends keyof T> = { [P in K]-?: NonNullable<T[P]> };

/** Utility to make certain keys of a type required */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> &
  PickAndRequire<T, K>;

export type NextLinkConfig = {
  href: string;
  as?: string;
};
