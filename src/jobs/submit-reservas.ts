import { prisma } from '../db/prisma.js';
import { dataDeHoje, getDataDeHojeISO } from '../lib/dates.js';
import { logger } from '../lib/logger.js';
import { submitReserva } from '../modules/formulario/formulario.service.js';
import {
  marcarAgendada,
  registrarTentativaFalha,
} from '../modules/reservas/reserva.service.js';

const emAndamento = new Set<Promise<void>>();

async function submitReservasPendentes(
  job: string,
  tentativasFiltro: number[],
): Promise<void> {
  const pendentes = await prisma.reserva.findMany({
    where: {
      dataReserva: dataDeHoje(),
      status: 'PENDENTE',
      tentativas: { in: tentativasFiltro },
    },
    include: { usuario: true },
    orderBy: { createdAt: 'asc' },
  });

  const resumo = {
    total: pendentes.length,
    agendadas: 0,
    falhas: 0,
    ignoradas: 0,
    erros: 0,
  };

  for (const reserva of pendentes) {
    try {
      // o usuário pode ter cancelado depois da consulta acima
      const atual = await prisma.reserva.findUnique({
        where: { id: reserva.id },
        select: { status: true },
      });

      if (atual?.status !== 'PENDENTE') {
        resumo.ignoradas++;
        continue;
      }

      const { usuario } = reserva;

      if (!usuario.perfil) {
        logger.error(
          { job, reservaId: reserva.id },
          'Reserva de usuário sem perfil.',
        );
        await registrarTentativaFalha(reserva.id);
        resumo.falhas++;
        continue;
      }

      const sucesso = await submitReserva({
        nome: usuario.nome,
        matricula: usuario.matricula,
        perfil: usuario.perfil,
        email: usuario.email,
        refeicao: reserva.refeicao,
        dataReserva: reserva.dataReserva,
      });

      if (sucesso) {
        await marcarAgendada(reserva.id);
        resumo.agendadas++;
      } else {
        await registrarTentativaFalha(reserva.id);
        resumo.falhas++;
      }
    } catch (err) {
      resumo.erros++;
      logger.error(
        { err, job, reservaId: reserva.id },
        'Erro ao processar reserva.',
      );
    }
  }

  logger.info(
    { job, data: getDataDeHojeISO(), tentativasFiltro, ...resumo },
    'Job concluído.',
  );
}

export function executarJob(
  job: string,
  tentativasFiltro: number[],
): Promise<void> {
  const execucao: Promise<void> = submitReservasPendentes(
    job,
    tentativasFiltro,
  ).finally(() => {
    emAndamento.delete(execucao);
  });

  emAndamento.add(execucao);
  return execucao;
}

export async function aguardarExecucoes(): Promise<void> {
  await Promise.allSettled([...emAndamento]);
}
