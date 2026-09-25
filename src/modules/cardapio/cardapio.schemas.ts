import { z } from 'zod';

export const listarCardapioQuerySchema = z
  .object({
    dataInicio: z.string().optional().meta({
      description: 'Data inicial do intervalo, formato YYYY-MM-DD.',
      example: '2026-09-01',
    }),
    dataFim: z.string().optional().meta({
      description: 'Data final do intervalo, formato YYYY-MM-DD.',
      example: '2026-09-30',
    }),
  })
  .meta({ id: 'ListarCardapioQuery' });

export const cardapioItemSchema = z
  .object({
    id: z.string(),
    data: z.string(),
    tipo: z.enum(['Almoco', 'Jantar', 'AlmocoEJantar']),
    menuDoDia: z.array(z.object({ nome: z.string() })),
    saladas: z.array(z.string()),
    suco: z.array(z.object({ nome: z.string() })).nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'CardapioItem' });
