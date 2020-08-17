/* eslint-disable camelcase */
import { State } from "opds-web-client/lib/state";
import { CollectionState } from "opds-web-client/lib/reducers/collection";
import {
  CollectionData,
  BookData,
  MediaType
} from "opds-web-client/lib/interfaces";

/**
 * OPDS DATA TYPES
 */

export type OPDSLinkRelation = string;
export type OPDSLinkRole = string;

export const HTMLMediaType = "text/html";
export type CPWMediaType = typeof HTMLMediaType | MediaType;

export interface OPDSLink {
  href: string;
  rel?: OPDSLinkRelation;
  title?: string;
  type?: CPWMediaType;
  role?: OPDSLinkRole;
}

/**
 * Auth Document
 */
type AuthDocLinkRelation =
  | "navigation"
  | "logo"
  | "register"
  | "help"
  | "privacy-policy"
  | "terms-of-service"
  | "about"
  | "alternate";

export interface AuthDocumentLink extends Omit<OPDSLink, "role"> {
  rel: AuthDocLinkRelation;
}

export interface OPDSAuthProvider {}

export interface Announcement {
  id: string;
  content: string;
}

export interface AuthDocument {
  id: string;
  title: string;
  // used to display text prompt to authenticating user
  description: string;
  links: AuthDocumentLink[];
  authentication: OPDSAuthProvider[];

  announcements?: Announcement[];
  // eslint-disable-next-line camelcase
  web_color_scheme?: {
    primary?: string;
    secondary?: string;
  };
}

/**
 * INTERNAL APP MODEL
 */

export interface PathFor {
  (collectionUrl?: string, bookUrl?: string): string;
}

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
  helpWebsite?: OPDSLink;
  helpEmail?: OPDSLink;
  libraryWebsite?: OPDSLink;
  tos?: OPDSLink;
  about?: OPDSLink;
  privacyPolicy?: OPDSLink;
  registration?: OPDSLink;
};

export interface LibraryData {
  slug: string | null;
  catalogUrl: string;
  catalogName: string;
  logoUrl: string | null;
  colors: {
    primary: string | null;
    secondary: string | null;
  };
  headerLinks: OPDSLink[];
  libraryLinks: LibraryLinks;
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
export type VariantProp<VType> = Exclude<keyof VType, keyof {}>;

/**
 * Utils
 */
export type SetCollectionAndBook = (
  collectionUrl: string,
  bookUrl: string
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
