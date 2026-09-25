import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/config.js';
import { POLICY_VERSION } from '../../constants/privacy-policy.js';
import { prisma } from '../../db/prisma.js';
import {
  AccountPendingApprovalError,
  ConsentRequiredError,
  UnauthorizedError,
} from '../../lib/errors.js';
import { assinarToken } from '../../lib/jtw.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const DOMINIO_UPF = '@upf.br';

interface LoginInput {
  googleToken: string;
  aceitarPolitica?: boolean;
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

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      matricula: usuario.matricula,
      origem: usuario.origem,
    },
  };
}
