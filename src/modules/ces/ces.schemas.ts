import { z } from 'zod';

export const CONTEXTOS_CES = ['primeira_reserva'] as const;

export const registrarCesSchema = z
  .object({
    contexto: z.enum(CONTEXTOS_CES).meta({
      description: 'Momento do app em que a pesquisa foi exibida.',
    }),
    nota: z.number().int().min(1).max(5).nullable().meta({
      description:
        'Nota de 1 (muito difícil) a 5 (muito fácil). Nulo quando o usuário fecha a pesquisa sem avaliar.',
    }),
    comentario: z
      .string()
      .trim()
      .max(1000, 'O comentário deve ter no máximo 1000 caracteres')
      .nullable()
      .optional()
      .transform((comentario) => comentario || null),
  })
  .meta({ id: 'RegistrarCesRequest' });

export const cesElegibilidadeSchema = z
  .object({
    exibirPesquisa: z.boolean().meta({
      description:
        'Verdadeiro quando o usuário já reservou e ainda não respondeu (nem fechou) a pesquisa.',
    }),
  })
  .meta({ id: 'CesElegibilidade' });
