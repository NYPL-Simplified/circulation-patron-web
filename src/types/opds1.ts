/* eslint-disable camelcase */

/**
 * Typings for OPDS 1.2. This is a working document and it
 * is not complete. It currently focuses on typing of links
 * and the AuthDocument. The Feed and Entry are pretty well
 * typed by opds-feed-parser.
 */

/**
 * Link Relations
 */
export const AuthDocLinkRelation = "http://opds-spec.org/auth/document";
export type AnyLinkRelation =
  | typeof AuthDocLinkRelation
  | AuthDocLinkRelations
  | "related";

/**
 * Link Roles
 */

export type AnyLinkRole = string;

/**
 * Media Types
 */

export const BaseDocumentMediaType =
  "application/atom+xml;profile=opds-catalog;kind=acquisition";
export const HTMLMediaType = "text/html";
export const AuthDocMediaType = "application/opds-authentication+json";

/**
 * Book media types
 */

export const EpubMediaType = "application/epub+zip";
export const KepubMediaType = "application/kepub+zip";
export const PdfMediaType = "application/pdf";
export const AdeptMediaType = "application/vnd.adobe.adept+xml";
export const IncorrectAdeptMediaType = "vnd.adobe/adept+xml";
export const MobiPocketMediaType = "application/x-mobipocket-ebook";
export const Mobi8Mediatype = "application/x-mobi8-ebook";
export const AudiobookMediaType = "application/audiobook+json";
export const AtomMediaType =
  'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"';
export const AtomXmlMediaType =
  "application/atom+xml;type=entry;profile=opds-catalog";
export const OverdriveAudiobookMediaType =
  "application/vnd.overdrive.circulation.api+json;profile=audiobook";
export const OverdriveEbookMediaType =
  "application/vnd.overdrive.circulation.api+json;profile=ebook";
export const AxisNowWebpubMediaType =
  "application/vnd.librarysimplified.axisnow+json";

export type ReadOnlineMediaType =
  | typeof AtomMediaType
  | typeof AxisNowWebpubMediaType;

export type AnyBookMediaType =
  | ReadOnlineMediaType
  | typeof EpubMediaType
  | typeof KepubMediaType
  | typeof PdfMediaType
  | typeof AdeptMediaType
  | typeof IncorrectAdeptMediaType
  | typeof MobiPocketMediaType
  | typeof Mobi8Mediatype
  | typeof AudiobookMediaType
  | typeof AtomXmlMediaType
  | typeof OverdriveAudiobookMediaType
  | typeof OverdriveEbookMediaType;

export type AnyMediaType =
  | AnyBookMediaType
  | typeof HTMLMediaType
  | typeof BaseDocumentMediaType
  | typeof AuthDocMediaType;

export interface Link {
  href: string;
  rel?: AnyLinkRelation;
  title?: string;
  type?: AnyMediaType;
  role?: AnyLinkRole;
}

/**
 * Auth Document
 */
type AuthDocLinkRelations =
  | "navigation"
  | "logo"
  | "register"
  | "help"
  | "privacy-policy"
  | "terms-of-service"
  | "about"
  | "alternate"
  | "authenticate";

export interface AuthDocumentLink extends Link {
  rel: AuthDocLinkRelations;
}

export const BasicAuthType = "http://opds-spec.org/auth/basic";
export const SamlAuthType = "http://librarysimplified.org/authtype/SAML-2.0";
export const CleverAuthType =
  "http://librarysimplified.org/authtype/OAuth-with-intermediary";
export const ImplicitGrantAuthType = "http://opds-spec.org/auth/oauth/implicit";
export const PasswordCredentialsAuthType =
  "http://opds-spec.org/auth/oauth/password";

export type AnyAuthType =
  | typeof BasicAuthType
  | typeof SamlAuthType
  | typeof CleverAuthType
  | typeof ImplicitGrantAuthType
  | typeof PasswordCredentialsAuthType;

// https://drafts.opds.io/authentication-for-opds-1.0
export interface AuthMethod<T extends AnyAuthType, L extends Link = Link> {
  type: T;
  description?: string;
  // https://drafts.opds.io/authentication-for-opds-1.0#312-links
  links?: L[];
}
export interface ServerSamlMethod
  extends AuthMethod<typeof SamlAuthType, SamlIdp> {}

export interface CleverAuthMethod extends AuthMethod<typeof CleverAuthType> {}

export interface BasicAuthMethod extends AuthMethod<typeof BasicAuthType> {
  labels: {
    login: string;
    password: string;
  };
}

export type ServerAuthMethod =
  | CleverAuthMethod
  | BasicAuthMethod
  | ServerSamlMethod;

export interface Announcement {
  id: string;
  content: string;
}

export interface AuthDocument {
  id: string;
  title: string;
  // used to display text prompt to authenticating user
  description?: string;
  links?: AuthDocumentLink[];
  authentication: ServerAuthMethod[];
  announcements?: Announcement[];
  web_color_scheme?: {
    primary?: string;
    secondary?: string;
  };
}

/**
 * SAML is an extension on the OPDS1 spec which only
 * works when backed by a Circulation Manager
 */
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
