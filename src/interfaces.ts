import { State } from "opds-web-client/lib/state";
import { CollectionState } from "opds-web-client/lib/reducers/collection";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";

export interface PathFor {
  (collectionUrl?: string, bookUrl?: string): string;
}

export interface ComplaintData {
  type: string;
  detail?: string;
}

export interface Link {
  href: string;
  rel?: string;
  title?: string;
  type?: string;
  role?: string;
}

export type LibraryLinks = {
  helpWebsite?: Link;
  helpEmail?: Link;
  libraryWebsite?: Link;
  tos?: Link;
  about?: Link;
  privacyPolicy?: Link;
  registration?: Link;
};

export interface LibraryData {
  id?: string;
  onlyLibrary?: boolean;
  catalogUrl: string;
  catalogName: string;
  logoUrl?: string;
  colors?: {
    background?: string;
    foreground?: string;
  };
  headerLinks?: Link[];
  cssLinks?: Link[];
  libraryLinks: LibraryLinks;
}

export interface PreloadedData {
  library: LibraryData;
  shortenUrls: boolean;
  initialState?: State;
  helmetContext?: any;
}
declare global {
  interface Window {
    // Our custom global holding data loaded by the server
    __PRELOADED_DATA__: PreloadedData;
  }
}

export interface WebpackAssets {
  CirculationPatronWeb: string[];
}

// our CPW useReducer states
export type RecommendationsState = CollectionState;
export type { ComplaintsState } from "./hooks/useComplaints/reducer";

export type { Theme, ButtonVariants, TextVariants } from "./theme";
// helper for theme variant prop types
export type VariantProp<VType> = Exclude<keyof VType, keyof {}>;

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
