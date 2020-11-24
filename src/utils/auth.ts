import { OPDS1, AppAuthMethod, ClientSamlMethod } from "interfaces";

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

export function generateCredentials(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}
