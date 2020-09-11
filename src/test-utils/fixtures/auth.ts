import { ClientSamlMethod, OPDS1 } from "interfaces";

export const basicAuthMethod = {
  labels: {
    login: "Barcode",
    password: "Pin"
  },
  type: OPDS1.BasicAuthType,
  description: "Library Barcode",
  inputs: {
    login: { keyboard: "Default" },
    password: { keyboard: "Default" }
  },
  links: [
    {
      href: "https://example.com/LoginButton280.png",
      rel: "logo"
    }
  ]
};

export const cleverAuthMethod: OPDS1.CleverAuthMethod = {
  description: "Clever",
  links: [
    {
      href: "https://example.com/oauth_authenticate?provider=Clever",
      rel: "authenticate"
    },
    {
      href: "https://example.com/CleverLoginButton280.png",
      rel: "logo"
    }
  ],
  type: OPDS1.CleverAuthType
};

export const samlAuthHref = "/saml-auth-url";
export const samlAuthProvider: ClientSamlMethod = {
  href: samlAuthHref,
  type: OPDS1.SamlAuthType,
  description: "SAML IdP",
  links: [
    {
      href: "https://example.com/LoginButton280.png",
      rel: "logo"
    }
  ]
};
