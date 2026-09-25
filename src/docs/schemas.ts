import { z } from 'zod';

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    code: z.string().optional(),
    details: z.unknown().optional(),
  })
  .meta({ id: 'ErrorResponse' });
