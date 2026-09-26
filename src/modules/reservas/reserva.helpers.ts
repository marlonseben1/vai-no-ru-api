import dayjs from 'dayjs';
import type { Refeicao, StatusReserva } from '../../generated/prisma/enums.js';

export const ALLOWED_SORT_COLUMNS = [
  'dataReserva',
  'refeicao',
  'status',
  'createdAt',
] as const;

export type SortColumn = (typeof ALLOWED_SORT_COLUMNS)[number];

export interface ListarReservasParams {
  page: number;
  pageSize: number;
  sort: SortColumn;
  order: 'asc' | 'desc';
  dataFiltro?: 'essa_semana' | 'semana_passada' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
  refeicao?: Refeicao;
  situacao?: StatusReserva;
}

function calcularSemana(offsetSemanas: 0 | 1) {
  const diaSemana = dayjs().day();
  const diasDesdeSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
  const segunda = dayjs()
    .subtract(diasDesdeSegunda + offsetSemanas * 7, 'day')
    .startOf('day');
  const domingo = segunda.add(6, 'day').endOf('day');

  return { inicio: segunda.toDate(), fim: domingo.toDate() };
}

export function buildWhereClause(
  usuarioId: string,
  params: ListarReservasParams,
) {
  const hoje = dayjs().startOf('day').toDate();
  const condicoesData: Record<string, unknown>[] = [];

  switch (params.dataFiltro) {
    case 'essa_semana': {
      const { inicio, fim } = calcularSemana(0);
      condicoesData.push({ dataReserva: { gte: inicio, lte: fim } });
      break;
    }
    case 'semana_passada': {
      const { inicio, fim } = calcularSemana(1);
      condicoesData.push({ dataReserva: { gte: inicio, lte: fim } });
      break;
    }
    case 'personalizado': {
      if (params.dataInicio && params.dataFim) {
        condicoesData.push({
          gte: new Date(params.dataInicio),
          lte: new Date(params.dataFim),
        });
      }
      break;
    }
    default:
      break;
  }

  if (params.situacao) {
    if (params.situacao === 'INATIVA') {
      condicoesData.push({ dataReserva: { lt: hoje } });
    } else {
      condicoesData.push({ dataReserva: { gte: hoje } });
    }
  }

  return {
    usuarioId,
    ...(params.refeicao ? { refeicao: params.refeicao } : {}),
    ...(params.situacao && params.situacao !== 'INATIVA'
      ? { status: params.situacao }
      : {}),
    ...(condicoesData.length > 0 ? { AND: condicoesData } : {}),
  };
}
