import { OPDS1, AppAuthMethod, ClientSamlMethod } from "interfaces";
import { OPDSFeed } from "opds-feed-parser";
import ApplicationError from "errors";

/**
 * Extracts an array of auth providers from the authentication document
 */
export function flattenSamlMethod(
  authDoc: OPDS1.AuthDocument
): AppAuthMethod[] {
  return authDoc.authentication.reduce<AppAuthMethod[]>((flattened, method) => {
    if (isServerSamlMethod(method)) {
      return [...flattened, ...serverToClientSamlMethods(method)];
    }
    return [...flattened, method];
  }, []);
}

export const isServerSamlMethod = (
  method: OPDS1.ServerAuthMethod
): method is OPDS1.ServerSamlMethod =>
  method.type === OPDS1.SamlAuthType && "links" in method;

function serverToClientSamlMethods(
  samlMethod: OPDS1.ServerSamlMethod
): ClientSamlMethod[] {
  if (!samlMethod.links) return [];
  return samlMethod.links.map(idp => ({
    href: idp.href,
    type: samlMethod.type,
    description: getEnglishValue(idp.display_names) ?? "Unknown SAML Provider"
  }));
}

export const getEnglishValue = (arr: [{ language: string; value: string }]) =>
  arr.find(item => item.language === "en")?.value;

/**
 * Extracts the href of an auth document from the links in an OPDSFeed.
 */
export function getAuthDocHref(catalog: OPDSFeed) {
  const link = catalog.links.find(
    link => link.rel === OPDS1.AuthDocLinkRelation
  );

  if (!link)
    throw new ApplicationError(
      "OPDS Catalog did not contain an auth document link."
    );
  return link.href;
}

export function generateCredentials(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}
