import { prisma } from '../../src/db/prisma.js';
import type {
  Refeicao,
  StatusReserva,
} from '../../src/generated/prisma/client.js';
import { adicionarDias, dataDeHoje } from '../../src/lib/dates.js';

// Ajuste o e-mail da seed antes de rodar
const USUARIO_TESTE_EMAIL = '';

function proximoDiaUtil(data: Date, direcao: 1 | -1): Date {
  let atual = data;
  do {
    atual = adicionarDias(atual, direcao);
  } while (atual.getUTCDay() === 0 || atual.getUTCDay() === 6);
  return atual;
}

async function seedUsuarioTeste() {
  return prisma.usuario.upsert({
    where: { email: USUARIO_TESTE_EMAIL },
    update: {},
    create: {
      email: USUARIO_TESTE_EMAIL,
      nome: 'Usuário de Teste',
      perfil: 'AlunoGraduacaoUPF',
      matricula: '123456',
      origem: 'UPF',
      status: 'ATIVO',
      consentimentoLgpdEm: new Date(),
      consentimentoLgpdVersao: 'seed',
    },
  });
}

interface ReservaSeedInput {
  usuarioId: string;
  dataReserva: Date;
  refeicao: Refeicao;
  status: StatusReserva;
  processado?: boolean;
  tentativas?: number;
  acaoExtra?: string;
}

async function upsertReservaComHistorico(input: ReservaSeedInput) {
  const existente = await prisma.reserva.findUnique({
    where: {
      usuarioId_dataReserva: {
        usuarioId: input.usuarioId,
        dataReserva: input.dataReserva,
      },
    },
  });

  if (existente) return existente;

  const reserva = await prisma.reserva.create({
    data: {
      usuarioId: input.usuarioId,
      dataReserva: input.dataReserva,
      refeicao: input.refeicao,
      status: input.status,
      processado: input.processado ?? false,
      tentativas: input.tentativas ?? 0,
    },
  });

  await prisma.reservaHistorico.create({
    data: { reservaId: reserva.id, acao: 'criada' },
  });

  if (input.acaoExtra) {
    await prisma.reservaHistorico.create({
      data: { reservaId: reserva.id, acao: input.acaoExtra },
    });
  }

  return reserva;
}

export async function seedReservas() {
  const usuario = await seedUsuarioTeste();
  const hoje = dataDeHoje();

  const estaSemana1 = proximoDiaUtil(hoje, 1);
  const estaSemana2 = proximoDiaUtil(estaSemana1, 1);
  const semanaPassada1 = proximoDiaUtil(hoje, -1);
  const semanaPassada2 = proximoDiaUtil(semanaPassada1, -1);
  const futura1 = proximoDiaUtil(adicionarDias(hoje, 14), 1);
  const futura2 = proximoDiaUtil(futura1, 1);

  // esta semana — ainda pendente de processamento
  await upsertReservaComHistorico({
    usuarioId: usuario.id,
    dataReserva: estaSemana1,
    refeicao: 'Almoco',
    status: 'PENDENTE',
  });

  // esta semana — esgotou as 3 tentativas
  await upsertReservaComHistorico({
    usuarioId: usuario.id,
    dataReserva: estaSemana2,
    refeicao: 'Jantar',
    status: 'NAO_AGENDADA',
    tentativas: 3,
    acaoExtra: 'nao_agendada',
  });

  // semana passada — foi agendada (aparece como INATIVA, data já passou)
  await upsertReservaComHistorico({
    usuarioId: usuario.id,
    dataReserva: semanaPassada1,
    refeicao: 'AlmocoEJantar',
    status: 'AGENDADA',
    processado: true,
    acaoExtra: 'agendada',
  });

  // semana passada — nunca foi processada (também aparece como INATIVA)
  await upsertReservaComHistorico({
    usuarioId: usuario.id,
    dataReserva: semanaPassada2,
    refeicao: 'Almoco',
    status: 'PENDENTE',
  });

  // futura — cancelada (testa o botão "Reativar")
  await upsertReservaComHistorico({
    usuarioId: usuario.id,
    dataReserva: futura1,
    refeicao: 'Jantar',
    status: 'CANCELADA',
    acaoExtra: 'cancelada',
  });

  // futura — já agendada, sem ação disponível
  await upsertReservaComHistorico({
    usuarioId: usuario.id,
    dataReserva: futura2,
    refeicao: 'Almoco',
    status: 'AGENDADA',
    processado: true,
    acaoExtra: 'agendada',
  });

  console.log(`Reservas semeadas para o usuário de teste (id: ${usuario.id}).`);
  console.log(`Gere um cookie de sessão com: pnpm token:teste ${usuario.id}`);
}
