import { AuthProvider, BasicAuthMethod } from "opds-web-client/lib/interfaces";
import BasicAuthForm from "auth/BasicAuthForm";
import { AuthState } from "opds-web-client/lib/reducers/auth";
import { BASIC_AUTH_ID } from "utils/auth";

export const basicAuthType = "http://opds-spec.org/auth/basic";

export const basicAuthMethod = {
  labels: {
    login: "Barcode",
    password: "Pin"
  },
  type: basicAuthType,
  description: "Library Barcode",
  inputs: {
    login: { keyboard: "Default" },
    password: { keyboard: "Default" }
  }
};

export const basicAuthProvider: AuthProvider<BasicAuthMethod> = {
  id: BASIC_AUTH_ID,
  plugin: {
    type: basicAuthType,
    formComponent: BasicAuthForm,
    buttonComponent: jest.fn(),
    lookForCredentials: jest.fn()
  },
  method: basicAuthMethod
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
