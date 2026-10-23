import type { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { ConflictError } from '../../lib/errors.js';
import type { registrarCesSchema } from './ces.schemas.js';

type RegistrarCesInput = z.infer<typeof registrarCesSchema>;

// a pesquisa é exibida uma única vez: responder ou fechar encerra a elegibilidade
export async function getPodeMostrarCes(usuarioId: string): Promise<boolean> {
  const [reservas, respostas] = await Promise.all([
    prisma.reserva.count({ where: { usuarioId } }),
    prisma.pesquisaCes.count({ where: { usuarioId } }),
  ]);

  return reservas > 0 && respostas === 0;
}

export async function registrarCes(
  usuarioId: string,
  input: RegistrarCesInput,
): Promise<void> {
  if (!(await getPodeMostrarCes(usuarioId))) {
    throw new ConflictError('O CES já foi respondido.');
  }

  await prisma.pesquisaCes.create({
    data: {
      usuarioId,
      nota: input.nota,
      comentario: input.nota === null ? null : input.comentario,
      contexto: input.contexto,
    },
  });
}
