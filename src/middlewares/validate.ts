import type { NextFunction, Request, Response } from 'express';
import type { core, ZodType } from 'zod';
import { ValidationError } from '../lib/errors.js';

function formatZodIssues(issues: core.$ZodIssue[]) {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError(
        'Invalid request body',
        formatZodIssues(result.error.issues),
      );
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw new ValidationError(
        'Invalid query parameters',
        formatZodIssues(result.error.issues),
      );
    }

    res.locals.query = result.data;
    next();
  };
}

export function validateParams(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      throw new ValidationError(
        'Invalid route parameters',
        formatZodIssues(result.error.issues),
      );
    }

    next();
  };
}
