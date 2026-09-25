import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/config.js';
import { POLICY_VERSION } from '../../constants/privacy-policy.js';
import { prisma } from '../../db/prisma.js';
import { ConsentRequiredError, UnauthorizedError } from '../../lib/errors.js';
import { assinarToken } from '../../lib/jtw.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface LoginInput {
  googleToken: string;
  aceitarPolitica?: boolean;
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
    throw new UnauthorizedError('Usuário não cadastrado');
  }

  if (!usuario.consentimentoLgpdEm) {
    if (!aceitarPolitica) {
      throw new ConsentRequiredError();
    }
  }

  if (!POLICY_VERSION) {
    throw new Error('POLICY_VERSION não configurada');
  }

  usuario = await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      consentimentoLgpdEm: new Date(),
      consentimentoLgpdVersao: POLICY_VERSION,
    },
  });

  const token = assinarToken({ sub: usuario.id });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      matricula: usuario.matricula,
    },
  };
}
