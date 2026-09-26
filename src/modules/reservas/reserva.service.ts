import dayjs from 'dayjs';
import type { z } from 'zod';
import { PERFIS_POR_ORIGEM } from '../../constants/perfil-origem.js';
import { prisma } from '../../db/prisma.js';
import { ValidationError } from '../../lib/errors.js';
import {
  buildWhereClause,
  type ListarReservasParams,
} from './reserva.helpers.js';
import type { criarReservasSchema } from './reserva.schemas.js';

type CriarReservasInput = z.infer<typeof criarReservasSchema>;

export async function criarReservas(
  usuarioId: string,
  input: CriarReservasInput,
) {
  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: usuarioId },
  });

  const perfisPermitidos = PERFIS_POR_ORIGEM[usuario.origem];

  if (!perfisPermitidos.includes(input.perfil)) {
    throw new ValidationError(
      'O perfil selecionado não é compatível com o tipo da sua conta.',
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: usuarioId },
      data: {
        nome: input.nome,
        perfil: input.perfil,
        matricula: input.matricula ?? null,
      },
    });

    const datasSolicitadas = input.dias.map((dia) => new Date(dia.data));

    const existentes = await tx.reserva.findMany({
      where: { usuarioId, dataReserva: { in: datasSolicitadas } },
      select: { dataReserva: true },
    });

    const datasExistentes = new Set(
      existentes.map((e) => e.dataReserva.toISOString().slice(0, 10)),
    );

    const reservasCriadas = [];

    for (const dia of input.dias) {
      if (datasExistentes.has(dia.data)) continue;

      const reserva = await tx.reserva.create({
        data: {
          usuarioId,
          dataReserva: new Date(dia.data),
          refeicao: dia.refeicao,
        },
      });

      await tx.reservaHistorico.create({
        data: { reservaId: reserva.id, acao: 'criada' },
      });

      reservasCriadas.push(reserva);
    }

    return reservasCriadas;
  });
}

export async function listarReservas(
  usuarioId: string,
  params: ListarReservasParams,
) {
  const where = buildWhereClause(usuarioId, params);
  const hoje = dayjs().startOf('day').toDate();

  const [total, reservas] = await Promise.all([
    prisma.reserva.count({ where }),
    prisma.reserva.findMany({
      where,
      orderBy: { [params.sort]: params.order },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  const data = reservas.map((reserva) => ({
    id: reserva.id,
    dataReserva: reserva.dataReserva,
    refeicao: reserva.refeicao,
    status: reserva.dataReserva < hoje ? 'INATIVA' : reserva.status,
    createdAt: reserva.createdAt,
  }));

  return { data, total, page: params.page, pageSize: params.pageSize };
}
