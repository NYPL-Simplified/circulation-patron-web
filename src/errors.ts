import { OPDS1 } from "interfaces";

export default class ApplicationError extends Error {
  info: OPDS1.ProblemDocument;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? `\nBase Error:\n${baseError.message}` : ""}`);
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.name = "Application Error";
    this.info = {
      title: "Application Error",
      detail: m
    };
  }
}

export class PageNotFoundError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, PageNotFoundError.prototype);
    this.name = "Page Not Found Error";
    this.info = {
      title: "Page Not Found",
      detail: m,
      status: 404
    };
  }
}

export class UnimplementedError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, UnimplementedError.prototype);
    this.name = "Unimplemented Error";
    this.info = {
      title: "Unimplemented",
      detail: m
    };
  }
}

export class AppSetupError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, AppSetupError.prototype);
    this.name = "App Setup Error";
    this.info = {
      status: 500,
      title: "App Setup Error",
      detail: m
    };
  }
}

function isProblemDocument(
  details: OPDS1.ProblemDocument | OPDS1.AuthDocument
): details is OPDS1.ProblemDocument {
  return !(typeof (details as OPDS1.AuthDocument).id === "string");
}
export class ServerError extends ApplicationError {
  // a default problem document
  url: string;
  info: OPDS1.ProblemDocument = {
    detail: "An unknown error server occurred.",
    title: "Server Error",
    status: 418
  };
  authDocument?: OPDS1.AuthDocument;

  constructor(
    url: string,
    status: number,
    details: OPDS1.ProblemDocument | OPDS1.AuthDocument
  ) {
    super("Server Error");
    this.url = url;
    Object.setPrototypeOf(this, ServerError.prototype);
    if (status === 401 && !isProblemDocument(details)) {
      // 401 errors return auth document instead of problem document
      // we will construct our own problem document.
      this.info = {
        title: "No Authorized",
        detail: "You are not authorized for the requested resource.",
        status: 401
      };
      this.authDocument = details;
    } else if (isProblemDocument(details)) {
      this.info = details;
    }
  }
}
