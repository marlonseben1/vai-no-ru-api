import { describe, expect, it } from 'vitest';
import {
  AccountPendingApprovalError,
  ConflictError,
  ConsentRequiredError,
  ForbiddenError,
  HttpError,
  MatriculaEmUsoError,
  NotFoundError,
  OnboardingRequiredError,
  UnauthorizedError,
  ValidationError,
} from '../../lib/errors.js';

describe('erros http', () => {
  it.each([
    [new ValidationError('x'), 422, 'VALIDATION_ERROR'],
    [new UnauthorizedError(), 401, 'UNAUTHORIZED'],
    [new ForbiddenError(), 403, 'FORBIDDEN'],
    [new NotFoundError(), 404, 'NOT_FOUND'],
    [new ConflictError('x'), 409, 'CONFLICT'],
    [new ConsentRequiredError(), 403, 'CONSENT_REQUIRED'],
    [new AccountPendingApprovalError(), 403, 'ACCOUNT_PENDING_APPROVAL'],
    [new OnboardingRequiredError(), 403, 'ONBOARDING_REQUIRED'],
  ])('%o tem status e code corretos', (erro, status, code) => {
    expect(erro).toBeInstanceOf(HttpError);
    expect(erro.status).toBe(status);
    expect(erro.code).toBe(code);
  });

  it('usa o nome da subclasse', () => {
    expect(new NotFoundError().name).toBe('NotFoundError');
  });

  it('preserva os detalhes de validação', () => {
    const detalhes = [{ field: 'nome', message: 'obrigatório' }];
    expect(new ValidationError('x', detalhes).details).toEqual(detalhes);
  });

  it('MatriculaEmUsoError é um ConflictError', () => {
    const erro = new MatriculaEmUsoError();
    expect(erro).toBeInstanceOf(ConflictError);
    expect(erro.status).toBe(409);
  });
});
