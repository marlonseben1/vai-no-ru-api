import { z } from 'zod';
import { Perfil } from '../../generated/prisma/client.js';

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
    perfil: z.string().nullable(),
    matricula: z.string().nullable(),
    origem: z.enum(['UPF', 'CONVIDADO']),
    onboardingConcluidoEm: z.string().nullable().meta({
      description:
        'Data de conclusão do onboarding. Nulo enquanto o usuário não o concluiu.',
    }),
  })
  .meta({ id: 'UsuarioPublico' });

export const loginResponseSchema = z
  .object({
    usuario: usuarioPublicoSchema,
  })
  .meta({ id: 'LoginResponse' });

export const onboardingSchema = z
  .object({
    nome: z.string().min(3, 'O nome deve conter pelo menos 3 caracteres'),
    perfil: z.enum(Perfil),
  })
  .meta({
    id: 'OnboardingRequest',
    description:
      'A matrícula não é enviada: o servidor a deduz do e-mail institucional.',
  });
