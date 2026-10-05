import cron from 'node-cron';
import {
  HORARIO_LIMITE,
  type JanelaEnvio,
} from '../constants/janelas-envio.js';
import { logger } from '../lib/logger.js';
import { getAmbienteFormulario } from '../modules/formulario/formulario.service.js';
import { aguardarExecucoes, executarJob } from './submit-reservas.js';

const FUSO = 'America/Sao_Paulo';

interface Agendamento {
  name: string;
  expressao: string;
  tentativas: number[];
  janela: JanelaEnvio;
}

// envia no horário limite da janela e refaz 5 e 10 minutos depois, só em dias úteis
function criarAgendamentos(janela: JanelaEnvio, nome: string): Agendamento[] {
  const { hora, minuto } = HORARIO_LIMITE[janela];

  return [
    {
      name: `submit-${nome}`,
      expressao: `${minuto} ${hora} * * 1-5`,
      tentativas: [0],
      janela,
    },
    {
      name: `retry-${nome}`,
      expressao: `${minuto + 5},${minuto + 10} ${hora} * * 1-5`,
      tentativas: [1, 2],
      janela,
    },
  ];
}

const AGENDAMENTOS: Agendamento[] = [
  ...criarAgendamentos('MANHA', 'manha'),
  ...criarAgendamentos('TARDE', 'tarde'),
];

const tasks: ReturnType<typeof cron.schedule>[] = [];

export function iniciarJobs(): void {
  const agendados: { job: string; proximaExecucao: Date | null }[] = [];

  for (const agendamento of AGENDAMENTOS) {
    const task = cron.schedule(
      agendamento.expressao,
      async () => {
        try {
          await executarJob(
            agendamento.name,
            agendamento.tentativas,
            agendamento.janela,
          );
        } catch (err) {
          logger.error({ err, job: agendamento.name }, 'Job falhou.');
        }
      },
      { name: agendamento.name, timezone: FUSO, noOverlap: true },
    );

    tasks.push(task);
    agendados.push({
      job: agendamento.name,
      proximaExecucao: task.getNextRun(),
    });
  }

  logger.info(
    { ambienteFormulario: getAmbienteFormulario(), jobs: agendados },
    'Jobs agendados.',
  );
}

export async function pararJobs(): Promise<void> {
  await Promise.all(tasks.map((task) => task.destroy()));
  await aguardarExecucoes();
}
