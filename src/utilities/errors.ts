class MissingEnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class SetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// **********************
// ***** API Errors *****
// **********************

class ApiError extends Error {
  public statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class AuthorizationError extends ApiError {
  public statusCode = 401;
}

class NotFoundError extends ApiError {
  public statusCode = 404;
}

export { MissingEnvironmentError, SetupError, AuthorizationError, NotFoundError };
export default ApiError;
