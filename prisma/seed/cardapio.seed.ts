import { prisma } from '../../src/db/prisma.js';

export async function seedCardapio() {
  await prisma.cardapio.createMany({
    data: [
      {
        data: new Date(),
        tipo: 'Almoco',
        menuDoDia: [
          { nome: 'Arroz e feijão' },
          { nome: 'Frango grelhado' },
          { nome: 'Purê de batata' },
        ],
        saladas: ['Alface', 'Tomate', 'Cenoura ralada'],
      },
      {
        data: new Date(Date.now() + 24 * 60 * 60 * 1000),
        tipo: 'Jantar',
        menuDoDia: [{ nome: 'Sopa de legumes' }, { nome: 'Pão integral' }],
        saladas: ['Rúcula', 'Pepino'],
      },
    ],
    skipDuplicates: true,
  });

  console.log('Cardápio adicionado');
}
