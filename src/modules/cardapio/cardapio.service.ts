import { prisma } from '../../db/prisma.js';
import { adicionarDias, dataDeHoje } from '../../lib/dates.js';

const LIMITE_PADRAO_DIAS = 60;

interface ListarCardapioInput {
  dataInicio?: string;
  dataFim?: string;
}

export async function listarCardapio({
  dataInicio,
  dataFim,
}: ListarCardapioInput) {
  const hoje = dataDeHoje();
  const filtroData =
    dataInicio || dataFim
      ? {
          ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
          ...(dataFim ? { lte: new Date(dataFim) } : {}),
        }
      : {
          gte: hoje,
          lte: adicionarDias(hoje, LIMITE_PADRAO_DIAS),
        };

  return prisma.cardapio.findMany({
    where: { data: filtroData },
    orderBy: { data: 'asc' },
    take: 200,
  });
}
