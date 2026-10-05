import {
  HORARIO_LIMITE,
  janelaDaRefeicao,
} from '../../constants/janelas-envio.js';
import type { Refeicao, StatusReserva } from '../../generated/prisma/client.js';
import {
  adicionarDias,
  dataDeHoje,
  getDataDeHojeISO,
  getMinutosDoDia,
} from '../../lib/dates.js';

export function formatarHorarioLimite(refeicao: Refeicao): string {
  const { hora, minuto } = HORARIO_LIMITE[janelaDaRefeicao(refeicao)];
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

// Só reservas de hoje podem estar fora do prazo: o cron envia no próprio dia.
export function prazoEncerrado(
  refeicao: Refeicao,
  dataISO: string,
  agora = new Date(),
): boolean {
  if (dataISO !== getDataDeHojeISO()) return false;

  const { hora, minuto } = HORARIO_LIMITE[janelaDaRefeicao(refeicao)];
  return getMinutosDoDia(agora) >= hora * 60 + minuto;
}

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
  const hoje = dataDeHoje();
  const diaSemana = hoje.getUTCDay(); // 0 = domingo
  const diasDesdeSegunda = diaSemana === 0 ? 6 : diaSemana - 1;

  const segunda = adicionarDias(hoje, -(diasDesdeSegunda + offsetSemanas * 7));
  const domingo = adicionarDias(segunda, 6);
  return { inicio: segunda, fim: domingo };
}

export function buildWhereClause(
  usuarioId: string,
  params: ListarReservasParams,
) {
  const hoje = dataDeHoje();
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
          dataReserva: {
            gte: new Date(params.dataInicio),
            lte: new Date(params.dataFim),
          },
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
