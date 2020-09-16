import { BookData, CollectionData, LinkData } from "interfaces";
/* eslint-disable camelcase */
import AuthPlugin from "./AuthPlugin";

// these properties need to be optional because they're used by RootProps,
// which doesn't implement them until Root is connected to the state by redux;
// initially, Root isn't provided most of these props
export interface StateProps {
  collectionData?: CollectionData;
  collectionUrl?: string;
  isFetchingCollection?: boolean;
  isFetchingBook?: boolean;
  error?: FetchErrorData;
  bookData?: BookData;
  bookUrl?: string;
  isFetchingPage?: boolean;
  history?: LinkData[];
  auth?: AuthData;
  authCredentials?: AuthCredentials;
  isSignedIn?: boolean;
  loansUrl?: string;
  loans?: BookData[];
  preferences?: {
    [key: string]: string;
  };
}

export interface PathFor {
  (collectionUrl?: string | null, bookUrl?: string | null): string;
}

export interface FetchErrorData {
  status: number | null;
  response: string;
  url: string;
}

export interface Location {
  pathname: string;
  state?: any;
}

export interface Router {
  push: (location: string | Location) => any;
  createHref: (location: string | Location) => string;
}

export interface NavigateContext {
  router?: Router;
  pathFor: PathFor;
}

export interface AuthCredentials {
  provider: string;
  credentials: string;
}

export interface AuthCallback {
  (): any;
}

/**
 * The provider has a method T, and the plugin might have a different
 * method, as is the case with SAML Auth where the plugin takes
 * a ClientSamlMethod but the original provider takes a ServerSamlMethod
 */
export interface AuthProvider<T extends AuthMethod, P extends AuthMethod = T> {
  id: string;
  plugin: AuthPlugin<P>;
  method: T;
}

export interface AuthLink {
  rel: string;
  href: string;
}
export interface AuthMethod {
  type: string;
  description?: string;
  links?: AuthLink[];
}

export interface AuthData {
  showForm: boolean;
  callback: AuthCallback | null;
  cancel: (() => void) | null;
  credentials: AuthCredentials | null;
  title: string | null;
  error: string | null;
  attemptedProvider: string | null;
  providers: AuthProvider<AuthMethod>[] | null;
}

/** Utility to make keys K of type T both required (defined) and not null */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> &
  { [P in K]-?: NonNullable<T[P]> };

export type SamlIdp = {
  privacy_statement_urls: [];
  logo_urls: [];
  display_names: [
    {
      language: string;
      value: string;
    }
  ];
  href: string;
  descriptions: [
    {
      language: string;
      value: string;
    }
  ];
  rel: "authenticate";
  information_urls: [];
};
/**
 * The server representation has multiple IDPs nested into the one.
 * We will flatten that out before placing into redux state.
 */
export interface ServerSamlMethod extends AuthMethod {
  links: SamlIdp[];
}
export interface ClientSamlMethod extends AuthMethod {
  href: string;
}
