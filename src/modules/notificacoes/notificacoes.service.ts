import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config/config.js';
import { logger } from '../../lib/logger.js';
import {
  type Email,
  montarEmailReservaAgendada,
  montarEmailReservaNaoAgendada,
} from './notificacoes.templates.js';

type Reserva = Parameters<typeof montarEmailReservaAgendada>[0];

let transporter: Transporter | undefined;

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

/** Nunca lança: falha de e-mail não pode interromper o job. */
async function enviar(
  para: string,
  { assunto, texto, html }: Email,
): Promise<void> {
  if (!env.EMAIL_ENABLED) {
    logger.debug({ assunto }, 'E-mail desabilitado, envio ignorado.');
    return;
  }

  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to: para,
      subject: assunto,
      text: texto,
      html,
    });
  } catch (err) {
    logger.error({ err, assunto }, 'Falha ao enviar e-mail.');
  }
}

export function enviarEmailReservaAgendada(para: string, reserva: Reserva) {
  return enviar(para, montarEmailReservaAgendada(reserva));
}

export function enviarEmailReservaNaoAgendada(para: string, reserva: Reserva) {
  return enviar(para, montarEmailReservaNaoAgendada(reserva));
}
