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

const categoriaItemSchema = z.number().int().min(0).max(2).meta({
  description:
    'Categoria do item: 0 = prato principal, 1 = acompanhamento, 2 = salada.',
});

const seloItemSchema = z.number().int().min(0).max(5).meta({
  description:
    'Selo do item: 0 = vegetariano, 1 = origem animal, 2 = origem suína, 3 = lactose, 4 = glúten, 5 = ovos.',
});

const menuItemSchema = z.object({
  nome: z.string(),
  categoria: categoriaItemSchema,
  selos: z.array(seloItemSchema),
});

export const cardapioItemSchema = z
  .object({
    id: z.string(),
    data: z.string(),
    tipo: z.enum(['Almoco', 'Jantar', 'AlmocoEJantar']),
    menuDoDia: z.array(menuItemSchema),
    saladas: z.array(z.string()),
    suco: z.array(z.object({ nome: z.string() })).nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: 'CardapioItem' });
