import { OPDS1 } from "interfaces";

export default class ApplicationError extends Error {
  info: OPDS1.ProblemDocument;
  baseError?: Error;

  constructor(info: Partial<OPDS1.ProblemDocument>, baseError?: Error) {
    const problemDoc = {
      title: "Application Error",
      detail: "An unknown Application Error Occurred",
      ...info
    };
    super(`${problemDoc.title}: ${problemDoc.detail}`);
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.name = `ApplicationError${info.title ? `: ${info.title}` : ""}`;
    this.baseError = baseError;
    this.info = problemDoc;
  }
}

export class PageNotFoundError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    const info = {
      title: "Page Not Found",
      detail: m,
      status: 404
    };
    super(info, baseError);
    Object.setPrototypeOf(this, PageNotFoundError.prototype);
    this.name = "Page Not Found Error";
  }
}

export class UnimplementedError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    const info = {
      title: "Unimplemented",
      detail: m
    };
    super(info, baseError);
    Object.setPrototypeOf(this, UnimplementedError.prototype);
    this.name = "Unimplemented Error";
  }
}

export class AppSetupError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    const info = {
      status: 500,
      title: "App Setup Error",
      detail: m
    };
    super(info, baseError);
    Object.setPrototypeOf(this, AppSetupError.prototype);
    this.name = "App Setup Error";
  }
}

/**
 * Specifically for when fetch rejects, not for when you get an invalid response.
 */
export class FetchError extends ApplicationError {
  url: string;

  constructor(url: string, baseError?: Error) {
    const info = {
      title: "Fetch Error",
      detail: `The fetch promise for the requested resource was rejected. This is probably an offline, CORS, or other network error. Requested URL: ${url}`
    };
    super(info, baseError);
    Object.setPrototypeOf(this, FetchError.prototype);
    this.name = "Fetch Error";
    this.url = url;
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
  authDocument?: OPDS1.AuthDocument;

  constructor(
    url: string,
    status: number,
    details: OPDS1.ProblemDocument | OPDS1.AuthDocument
  ) {
    // default info in case no problem doc came back and it wasn't a 401
    let info: OPDS1.ProblemDocument = {
      title: "Unknown Server Error",
      detail: `The Circulation Manager returned a ${status} error for: ${url}.`,
      status
    };
    if (isProblemDocument(details)) {
      // if the server returned a problem document
      info = details;
    } else if (status === 401) {
      // if the server returned a 401 with an authentication document
      // we build our own problem document
      info = {
        title: "Not Authorized",
        detail: "You are not authorized for the requested resource.",
        status: 401
      };
    }
    super(info);

    // if the server returned a 401 with a non problem document, we assume
    // it returned an authentication document.
    if (status === 401 && !isProblemDocument(details))
      this.authDocument = details;

    this.url = url;
    Object.setPrototypeOf(this, ServerError.prototype);
    this.name = `Server Error`;
  }
}
