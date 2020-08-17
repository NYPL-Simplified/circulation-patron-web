export default class ApplicationError extends Error {
  readonly statusCode?: number = undefined;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.name = "Application Error";
  }
}

export class PageNotFoundError extends ApplicationError {
  readonly statusCode = 404;
}

export class UnimplementedError extends ApplicationError {}

export class AppSetupError extends ApplicationError {}
