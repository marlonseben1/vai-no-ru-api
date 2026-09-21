import { HttpStatus } from '../constants/http-status.js';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Access denied') {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message);
  }
}
