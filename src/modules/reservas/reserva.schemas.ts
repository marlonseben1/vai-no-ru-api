import { z } from 'zod';
import {
  Perfil,
  Refeicao,
  StatusReserva,
} from '../../generated/prisma/client.js';
import { ALLOWED_SORT_COLUMNS } from './reserva.helpers.js';

export const reservaDiaSchema = z
  .object({
    data: z.iso.date().meta({
      description: 'Data da reserva, formato YYYY-MM-DD.',
      example: '2026-10-01',
    }),
    refeicao: z.enum(Refeicao),
  })
  .meta({ id: 'ReservaDia' });

export const criarReservasSchema = z
  .object({
    nome: z.string().min(3, 'O nome deve conter pelo menos 3 caracteres'),
    matricula: z
      .string()
      .regex(/^\d*$/, 'A matrícula deve conter apenas números')
      .optional(),
    perfil: z.enum(Perfil),
    dias: z
      .array(reservaDiaSchema)
      .min(1, 'Você deve informar pelo menos uma data')
      .refine(
        (dias) => {
          const hoje = new Date().toISOString().slice(0, 10);
          return dias.every((d) => d.data >= hoje);
        },
        { error: 'Não é possível reservar datas passadas' },
      )
      .refine(
        (dias) =>
          dias.every((d) => {
            const diaSemana = new Date(`${d.data}T00:00:00Z`).getUTCDay();
            return diaSemana !== 0 && diaSemana !== 6;
          }),
        { error: 'Reservas só podem ser feitas de segunda a sexta' },
      ),
  })
  .superRefine((body, ctx) => {
    if (
      body.perfil === Perfil.AlunoGraduacaoUPF &&
      (!body.matricula || body.matricula.trim() === '')
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe o número da matrícula',
        path: ['matricula'],
      });
    }
  })
  .meta({ id: 'CriarReservasRequest' });

export const listarReservasQuerySchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
    sort: z.enum(ALLOWED_SORT_COLUMNS).default('dataReserva'),
    order: z.enum(['asc', 'desc']).default('desc'),
    dataFiltro: z
      .enum(['essa_semana', 'semana_passada', 'personalizado'])
      .optional(),
    dataInicio: z.iso.date().optional(),
    dataFim: z.iso.date().optional(),
    refeicao: z.enum(Refeicao).optional(),
    situacao: z.enum(StatusReserva).optional(),
  })
  .meta({ id: 'ListarReservasQuery' });
