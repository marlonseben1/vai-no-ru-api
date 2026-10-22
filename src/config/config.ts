import { z } from 'zod';
import { resolverAmbienteFormulario } from '../modules/formulario/formulario.constants.js';

const optionalUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.url().optional(),
);

const emailList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number().default(3003),
    DATABASE_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    WEB_URL: z.url(),
    GOOGLE_FORM_URL_PROD: optionalUrl,
    GOOGLE_FORM_URL_STAGING: optionalUrl,
    FORM_AMBIENTE: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.enum(['PRODUCTION', 'STAGING']).optional(),
    ),
    ENABLE_JOBS: z.stringbool().default(true),
    ALLOWED_LOGIN_EMAILS: emailList,
  })
  .superRefine((env, ctx) => {
    const ambienteFormulario = resolverAmbienteFormulario(
      env.NODE_ENV,
      env.FORM_AMBIENTE,
    );

    if (ambienteFormulario === 'PRODUCTION' && !env.GOOGLE_FORM_URL_PROD) {
      ctx.addIssue({
        code: 'custom',
        path: ['GOOGLE_FORM_URL_PROD'],
        message: 'Obrigatória quando o formulário é o de produção.',
      });
    }
  });

export const env = schema.parse(process.env);
