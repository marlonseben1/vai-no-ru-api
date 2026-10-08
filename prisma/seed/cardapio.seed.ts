import { prisma } from '../../src/db/prisma.js';
import { adicionarDias, dataDeHoje } from '../../src/lib/dates.js';

const PRATO_PRINCIPAL = 0;
const ACOMPANHAMENTO = 1;
const SALADA = 2;

const VEGETARIANO = 0;
const ORIGEM_ANIMAL = 1;
const ORIGEM_SUINA = 2;
const LACTOSE = 3;
const GLUTEN = 4;
const OVOS = 5;

const salada = (nome: string) => ({
  nome,
  categoria: SALADA,
  selos: [VEGETARIANO],
});

// segunda a sexta, na ordem
const CARDAPIO_SEMANAL = [
  {
    menuDoDia: [
      {
        nome: 'Frango grelhado',
        categoria: PRATO_PRINCIPAL,
        selos: [ORIGEM_ANIMAL],
      },
      { nome: 'Arroz e feijão', categoria: ACOMPANHAMENTO, selos: [] },
      { nome: 'Purê de batata', categoria: ACOMPANHAMENTO, selos: [LACTOSE] },
      salada('Alface'),
      salada('Tomate'),
      salada('Cenoura ralada'),
    ],
    saladas: [],
  },
  {
    menuDoDia: [
      {
        nome: 'Carne moída com legumes',
        categoria: PRATO_PRINCIPAL,
        selos: [ORIGEM_ANIMAL],
      },
      { nome: 'Arroz e feijão', categoria: ACOMPANHAMENTO, selos: [] },
      {
        nome: 'Macarrão ao alho e óleo',
        categoria: ACOMPANHAMENTO,
        selos: [GLUTEN],
      },
      salada('Rúcula'),
      salada('Pepino'),
      salada('Beterraba'),
    ],
    saladas: [],
  },
  {
    menuDoDia: [
      {
        nome: 'Feijoada',
        categoria: PRATO_PRINCIPAL,
        selos: [ORIGEM_ANIMAL, ORIGEM_SUINA],
      },
      { nome: 'Arroz branco', categoria: ACOMPANHAMENTO, selos: [] },
      {
        nome: 'Couve refogada',
        categoria: ACOMPANHAMENTO,
        selos: [VEGETARIANO],
      },
      salada('Alface'),
      salada('Laranja'),
      salada('Repolho'),
    ],
    saladas: [],
  },
  {
    menuDoDia: [
      {
        nome: 'Omelete de legumes',
        categoria: PRATO_PRINCIPAL,
        selos: [OVOS, LACTOSE],
      },
      { nome: 'Arroz e feijão', categoria: ACOMPANHAMENTO, selos: [] },
      {
        nome: 'Batata assada',
        categoria: ACOMPANHAMENTO,
        selos: [VEGETARIANO],
      },
      salada('Tomate'),
      salada('Cenoura ralada'),
      salada('Pepino'),
    ],
    saladas: [],
  },
  {
    menuDoDia: [
      {
        nome: 'Filé de peixe ao molho',
        categoria: PRATO_PRINCIPAL,
        selos: [ORIGEM_ANIMAL, GLUTEN],
      },
      { nome: 'Arroz e feijão', categoria: ACOMPANHAMENTO, selos: [] },
      {
        nome: 'Legumes no vapor',
        categoria: ACOMPANHAMENTO,
        selos: [VEGETARIANO],
      },
      salada('Alface'),
      salada('Tomate'),
      salada('Beterraba'),
    ],
    saladas: [],
  },
];

export async function seedCardapio() {
  const hoje = dataDeHoje();
  const diaDaSemana = hoje.getUTCDay();
  // mesma regra do front: domingo mostra a semana que acabou de passar
  const segunda = adicionarDias(hoje, diaDaSemana === 0 ? -6 : 1 - diaDaSemana);

  await prisma.cardapio.createMany({
    data: CARDAPIO_SEMANAL.map((dia, indice) => ({
      data: adicionarDias(segunda, indice),
      tipo: 'Almoco' as const,
      ...dia,
    })),
    skipDuplicates: true,
  });

  console.log('Cardápio adicionado');
}
