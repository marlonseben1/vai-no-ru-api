import { env } from '../src/config/config.js';
import type { JanelaEnvio } from '../src/constants/janelas-envio.js';
import { prisma } from '../src/db/prisma.js';
import { executarJob } from '../src/jobs/submit-reservas.js';

if (env.NODE_ENV === 'production') {
  console.error('Este script só pode rodar fora de produção.');
  process.exit(1);
}

// Argumentos opcionais, em qualquer ordem:
// - janela (MANHA ou TARDE): envia só as refeições daquela janela, como o cron.
//   Sem janela, almoço e jantar são enviados juntos.
// - tentativas: filtra as reservas pendentes de hoje pelo número de tentativas
//   que já falharam. O cron usa [0] no envio principal e [1, 2] nos retries;
//   sem números, pega todas.
//
//   pnpm job:executar           -> todas as pendentes de hoje
//   pnpm job:executar MANHA 0   -> simula o envio das 9h30
//   pnpm job:executar TARDE 1 2 -> simula os retries da tarde
const JANELAS: JanelaEnvio[] = ['MANHA', 'TARDE'];

let janela: JanelaEnvio | undefined;
const filtro: number[] = [];

for (const arg of process.argv.slice(2)) {
  const valor = arg.toUpperCase();

  if (JANELAS.includes(valor as JanelaEnvio)) {
    janela = valor as JanelaEnvio;
  } else if (/^\d+$/.test(arg)) {
    filtro.push(Number(arg));
  } else {
    console.error(
      `Argumento inválido: ${arg}. Use MANHA, TARDE ou números de tentativas.`,
    );
    process.exit(1);
  }
}

await executarJob('manual', filtro.length > 0 ? filtro : [0, 1, 2], janela);
await prisma.$disconnect();
