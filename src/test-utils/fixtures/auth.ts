import {
  AuthProvider,
  BasicAuthMethod,
  ClientSamlMethod
} from "opds-web-client/lib/interfaces";
import BasicAuthForm from "auth/BasicAuthForm";
import { AuthState } from "opds-web-client/lib/reducers/auth";
import SamlAuthForm from "auth/SamlAuthForm";

export const basicAuthId = "http://opds-spec.org/auth/basic";
export const samlAuthId = "http://librarysimplified.org/authtype/SAML-2.0";

export const basicAuthMethod = {
  labels: {
    login: "Barcode",
    password: "Pin"
  },
  type: basicAuthId,
  description: "Library Barcode",
  inputs: {
    login: { keyboard: "Default" },
    password: { keyboard: "Default" }
  }
};

export const basicAuthProvider: AuthProvider<BasicAuthMethod> = {
  id: basicAuthId,
  plugin: {
    type: basicAuthId,
    formComponent: BasicAuthForm,
    buttonComponent: jest.fn(),
    lookForCredentials: jest.fn()
  },
  method: basicAuthMethod
};

export const samlAuthHref = "/saml-auth-url";
export const samlAuthProvider: AuthProvider<ClientSamlMethod> = {
  id: samlAuthHref,
  plugin: {
    type: samlAuthId,
    formComponent: SamlAuthForm,
    buttonComponent: jest.fn(),
    lookForCredentials: jest.fn()
  },
  method: {
    href: samlAuthHref,
    type: samlAuthId,
    description: "SAML IdP"
  }
};

export const unauthenticatedAuthState: AuthState = {
  showForm: false,
  callback: null,
  cancel: null,
  credentials: null,
  title: null,
  error: null,
  attemptedProvider: null,
  providers: [basicAuthProvider]
};
