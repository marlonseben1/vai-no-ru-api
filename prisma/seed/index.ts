import { seedCardapio } from './cardapio.seed.js';
import { seedReservas } from './reserva.seed.js';

async function main() {
  await seedCardapio();
  await seedReservas();
  console.log('Seed concluída');
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
