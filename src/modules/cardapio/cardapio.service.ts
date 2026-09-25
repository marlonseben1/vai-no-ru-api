import { prisma } from '../../db/prisma.js';

const LIMITE_PADRAO_DIAS = 60;

interface ListarCardapioInput {
  dataInicio?: string;
  dataFim?: string;
}

export async function listarCardapio({
  dataInicio,
  dataFim,
}: ListarCardapioInput) {
  const filtroData =
    dataInicio || dataFim
      ? {
          ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
          ...(dataFim ? { lte: new Date(dataFim) } : {}),
        }
      : {
          gte: new Date(),
          lte: new Date(Date.now() + LIMITE_PADRAO_DIAS * 24 * 60 * 60 * 1000),
        };

  return prisma.cardapio.findMany({
    where: { data: filtroData },
    orderBy: { data: 'asc' },
    take: 200,
  });
}
