import { prisma } from '../../src/db/prisma.js';
import { adicionarDias, dataDeHoje } from '../../src/lib/dates.js';

export async function seedCardapio() {
  const hoje = dataDeHoje();
  await prisma.cardapio.createMany({
    data: [
      {
        data: hoje,
        tipo: 'Almoco',
        menuDoDia: [
          { nome: 'Arroz e feijão' },
          { nome: 'Frango grelhado' },
          { nome: 'Purê de batata' },
        ],
        saladas: ['Alface', 'Tomate', 'Cenoura ralada'],
      },
      {
        data: adicionarDias(hoje, 1),
        tipo: 'Jantar',
        menuDoDia: [{ nome: 'Sopa de legumes' }, { nome: 'Pão integral' }],
        saladas: ['Rúcula', 'Pepino'],
      },
    ],
    skipDuplicates: true,
  });

  console.log('Cardápio adicionado');
}
