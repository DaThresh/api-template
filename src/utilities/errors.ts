// **********************
// ***** API Errors *****
// **********************

export class ApiError extends Error {
  public statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthenticationError extends ApiError {
  public statusCode = 401;
}

export class AuthorizationError extends ApiError {
  public statusCode = 403;
}

export class NotFoundError extends ApiError {
  public statusCode = 404;
}

export class InternalError extends ApiError {
  public statusCode = 500;
}
