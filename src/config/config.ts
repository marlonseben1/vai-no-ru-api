import { z } from 'zod';

const optionalUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.url().optional(),
);

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number().default(3003),
    DATABASE_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    GOOGLE_FORM_URL_PROD: optionalUrl,
    GOOGLE_FORM_URL_STAGING: optionalUrl,
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.GOOGLE_FORM_URL_PROD) {
      ctx.addIssue({
        code: 'custom',
        path: ['GOOGLE_FORM_URL_PROD'],
        message: 'Obrigatória em produção.',
      });
    }
  });

export const env = schema.parse(process.env);
