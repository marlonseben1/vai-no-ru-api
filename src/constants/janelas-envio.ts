import { Refeicao } from '../generated/prisma/enums.js';

export type JanelaEnvio = 'MANHA' | 'TARDE';

// Horário em que o cron envia as reservas do dia ao formulário do RU.
// Reservas criadas depois desse horário não entram mais na janela.
export const HORARIO_LIMITE: Record<
  JanelaEnvio,
  { hora: number; minuto: number }
> = {
  MANHA: { hora: 9, minuto: 30 },
  TARDE: { hora: 15, minuto: 30 },
};

// Almoço (e almoço + jantar) sai pela manhã; só jantar sai à tarde.
export const REFEICOES_POR_JANELA: Record<JanelaEnvio, Refeicao[]> = {
  MANHA: [Refeicao.Almoco, Refeicao.AlmocoEJantar],
  TARDE: [Refeicao.Jantar],
};

export function janelaDaRefeicao(refeicao: Refeicao): JanelaEnvio {
  return refeicao === Refeicao.Jantar ? 'TARDE' : 'MANHA';
}
