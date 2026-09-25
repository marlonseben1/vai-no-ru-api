import { z } from 'zod';

export const loginSchema = z
  .object({
    token: z.string().min(1).meta({
      description: 'ID token retornado pelo login do Google no front-end.',
    }),
    aceitarPolitica: z.boolean().optional().meta({
      description:
        'Confirma o aceite da política de privacidade. Obrigatório apenas no primeiro login.',
    }),
  })
  .meta({ id: 'LoginRequest' });

export const usuarioPublicoSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    email: z.email(),
    perfil: z.string(),
    matricula: z.string().nullable(),
  })
  .meta({ id: 'UsuarioPublico' });

export const loginResponseSchema = z
  .object({
    token: z.string().meta({
      description:
        'JWT a ser enviado no header Authorization das próximas requisições.',
    }),
    usuario: usuarioPublicoSchema,
  })
  .meta({ id: 'LoginResponse' });
