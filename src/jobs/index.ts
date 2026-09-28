import cron from 'node-cron';
import { logger } from '../lib/logger.js';
import { getAmbienteFormulario } from '../modules/formulario/formulario.service.js';
import { aguardarExecucoes, executarJob } from './submit-reservas.js';

const FUSO = 'America/Sao_Paulo';

interface Agendamento {
  name: string;
  expressao: string;
  tentativas: number[];
}

const AGENDAMENTOS: Agendamento[] = [
  { name: 'submit-dia', expressao: '30 9,15 * * 1-5', tentativas: [0] },
  { name: 'submit-noite', expressao: '0 23 * * 1-5', tentativas: [0] },
  { name: 'retry-dia', expressao: '35,40 9,15 * * 1-5', tentativas: [1, 2] },
  { name: 'retry-noite', expressao: '5,10 23 * * 1-5', tentativas: [1, 2] },
];

const tasks: ReturnType<typeof cron.schedule>[] = [];

export function iniciarJobs(): void {
  const agendados: { job: string; proximaExecucao: Date | null }[] = [];

  for (const agendamento of AGENDAMENTOS) {
    const task = cron.schedule(
      agendamento.expressao,
      async () => {
        try {
          await executarJob(agendamento.name, agendamento.tentativas);
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
