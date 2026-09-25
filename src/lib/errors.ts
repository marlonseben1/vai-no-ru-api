import { HttpStatus } from '../constants/http-status.js';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
    public readonly code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(
      HttpStatus.UNPROCESSABLE_ENTITY,
      message,
      details,
      'VALIDATION_ERROR',
    );
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized.') {
    super(HttpStatus.UNAUTHORIZED, message, undefined, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Access denied.') {
    super(HttpStatus.FORBIDDEN, message, undefined, 'FORBIDDEN');
  }
}

export class ConsentRequiredError extends HttpError {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      'É necessário aceitar a política de privacidade para continuar.',
      undefined,
      'CONSENT_REQUIRED',
    );
  }
}

export class AccountPendingApprovalError extends HttpError {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      'Sua conta de convidado está aguardando aprovação.',
      undefined,
      'ACCOUNT_PENDING_APPROVAL',
    );
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found.') {
    super(HttpStatus.NOT_FOUND, message, undefined, 'NOT_FOUND');
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message, undefined, 'CONFLICT');
  }
}
