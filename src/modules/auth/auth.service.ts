import { OAuth2Client } from 'google-auth-library';
import type { z } from 'zod';
import { env } from '../../config/config.js';
import { PERFIS_POR_ORIGEM } from '../../constants/perfil-origem.js';
import { POLICY_VERSION } from '../../constants/privacy-policy.js';
import { prisma } from '../../db/prisma.js';
import { Prisma, type Usuario } from '../../generated/prisma/client.js';
import {
  AccountPendingApprovalError,
  ConsentRequiredError,
  MatriculaEmUsoError,
  UnauthorizedError,
  ValidationError,
} from '../../lib/errors.js';
import { assinarToken } from '../../lib/jtw.js';
import { extrairMatriculaDoEmail } from './auth.helpers.js';
import type { onboardingSchema } from './auth.schemas.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const DOMINIO_UPF = '@upf.br';

type OnboardingInput = z.infer<typeof onboardingSchema>;

interface LoginInput {
  googleToken: string;
  aceitarPolitica?: boolean;
}

function serializarUsuario(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    matricula: usuario.matricula,
    origem: usuario.origem,
    onboardingConcluidoEm: usuario.onboardingConcluidoEm?.toISOString() ?? null,
  };
}

function determinarMatricula(email: string, perfil: Usuario['perfil']) {
  if (perfil !== 'AlunoGraduacaoUPF') return null;

  const matricula = extrairMatriculaDoEmail(email);

  if (!matricula) {
    throw new ValidationError(
      'O perfil Aluno graduação UPF exige um e-mail institucional com o número da matrícula.',
    );
  }

  return matricula;
}

function determinarOrigem(email: string): 'UPF' | 'CONVIDADO' {
  return email.toLowerCase().endsWith(DOMINIO_UPF) ? 'UPF' : 'CONVIDADO';
}

function exigirConsentimento(aceitarPolitica?: boolean): void {
  if (!aceitarPolitica) {
    throw new ConsentRequiredError();
  }

  if (!POLICY_VERSION) {
    throw new Error('POLICY_VERSION não configurada');
  }
}

export async function loginComGoogle({
  googleToken,
  aceitarPolitica,
}: LoginInput) {
  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    throw new UnauthorizedError('Token do Google inválido');
  }

  let usuario = await prisma.usuario.findUnique({
    where: { email: payload.email },
  });

  if (!usuario) {
    exigirConsentimento(aceitarPolitica);

    const origem = determinarOrigem(payload.email);

    usuario = await prisma.usuario.create({
      data: {
        email: payload.email,
        nome: payload.name ?? payload.email.split('@')[0] ?? payload.email,
        origem,
        status: origem === 'UPF' ? 'ATIVO' : 'PENDENTE_APROVACAO',
        consentimentoLgpdEm: new Date(),
        consentimentoLgpdVersao: POLICY_VERSION,
      },
    });
  } else if (!usuario.consentimentoLgpdEm) {
    exigirConsentimento(aceitarPolitica);

    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        consentimentoLgpdEm: new Date(),
        consentimentoLgpdVersao: POLICY_VERSION,
      },
    });
  }

  if (usuario.status === 'PENDENTE_APROVACAO') {
    throw new AccountPendingApprovalError();
  }

  const token = assinarToken({ sub: usuario.id });

  return { token, usuario: serializarUsuario(usuario) };
}

export async function buscarUsuarioAtual(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

  if (!usuario) {
    throw new UnauthorizedError();
  }

  return serializarUsuario(usuario);
}

export async function concluirOnboarding(
  usuarioId: string,
  input: OnboardingInput,
) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new UnauthorizedError();
  }

  if (!PERFIS_POR_ORIGEM[usuario.origem].includes(input.perfil)) {
    throw new ValidationError(
      'O perfil selecionado não é compatível com o tipo da sua conta.',
    );
  }

  const matricula = determinarMatricula(usuario.email, input.perfil);

  if (matricula) {
    const outraConta = await prisma.usuario.findFirst({
      where: { matricula, id: { not: usuarioId } },
      select: { id: true },
    });

    if (outraConta) throw new MatriculaEmUsoError();
  }

  try {
    const atualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nome: input.nome,
        perfil: input.perfil,
        matricula,
        onboardingConcluidoEm: usuario.onboardingConcluidoEm ?? new Date(),
      },
    });

    return serializarUsuario(atualizado);
  } catch (err) {
    // outra requisição pode ter gravado a mesma matrícula entre a checagem e o update
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new MatriculaEmUsoError();
    }
    throw err;
  }
}
