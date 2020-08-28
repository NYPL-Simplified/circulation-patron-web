export default class ApplicationError extends Error {
  readonly statusCode: number | null = null;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? `\nBase Error:\n${baseError.message}` : ""}`);
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.name = "Application Error";
  }
}

export class PageNotFoundError extends ApplicationError {
  readonly statusCode = 404;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, PageNotFoundError.prototype);
    this.name = "Page Not Found Error";
  }
}

export class UnimplementedError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, UnimplementedError.prototype);
    this.name = "Unimplemented Error";
  }
}

export class AppSetupError extends ApplicationError {
  readonly statusCode = 500;

  constructor(m: string, baseError?: Error) {
    super(`${m}${baseError ? baseError.message : ""}`);
    Object.setPrototypeOf(this, AppSetupError.prototype);
    this.name = "App Setup Error";
  }
}
