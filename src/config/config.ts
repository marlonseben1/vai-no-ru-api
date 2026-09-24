import z from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3003),
  DATABASE_URL: z.url(),
});

export const env = schema.parse(process.env);
