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

class InternalError extends ApiError {
  public statusCode = 500;
}

export { AuthorizationError, InternalError, NotFoundError };
export default ApiError;
