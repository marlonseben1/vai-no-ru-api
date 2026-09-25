import { seedCardapio } from './cardapio.seed.js';

async function main() {
  await seedCardapio();
  console.log('Seed concluída');
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
