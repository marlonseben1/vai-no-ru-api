import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../lib/errors.js';
import { verificarToken } from '../lib/jtw.js';

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token ausente ou inválido.');
  }

  const token = header.slice('Bearer '.length);

  try {
    req.usuario = verificarToken(token);
  } catch {
    throw new UnauthorizedError('Token ausente ou inválido.');
  }

  next();
}
