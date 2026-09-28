import { env } from '../../config/config.js';
import type { Perfil, Refeicao } from '../../generated/prisma/enums.js';
import { logger } from '../../lib/logger.js';
import {
  type AmbienteFormulario,
  GOOGLE_ENTRIES,
  PERFIL_LABEL,
  REFEICAO_LABEL,
} from './formulario.constants.js';

const TIMEOUT_ENVIO_MS = 15_000;

export interface DadosSubmitReserva {
  nome: string;
  matricula: string | null;
  perfil: Perfil;
  email: string;
  refeicao: Refeicao;
  dataReserva: Date;
}

export function getAmbienteFormulario(): AmbienteFormulario {
  return env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING';
}

export function getFormularioUrl(ambiente: AmbienteFormulario): string {
  const url =
    ambiente === 'PRODUCTION'
      ? env.GOOGLE_FORM_URL_PROD
      : env.GOOGLE_FORM_URL_STAGING;

  if (!url) {
    throw new Error(`A variável GOOGLE_FORM_URL_${ambiente} não está definida`);
  }

  return url;
}

export function derivarUrlSubmit(urlFormulario: string): string {
  const url = new URL(urlFormulario);
  url.search = '';
  url.hash = '';

  if (!/\/(viewform|formResponse)$/.test(url.pathname)) {
    throw new Error(
      'A URL do formulário deve terminar em /viewform (links encurtados forms.gle não funcionam).',
    );
  }

  url.pathname = url.pathname.replace(/\/viewform$/, '/formResponse');
  return url.toString();
}

export function montarPayloadFormulario(
  dados: DadosSubmitReserva,
  ambiente: AmbienteFormulario,
): URLSearchParams {
  const entries = GOOGLE_ENTRIES[ambiente];
  const payload = new URLSearchParams();

  payload.append(entries.NOME, dados.nome);
  if (dados.matricula) payload.append(entries.MATRICULA, dados.matricula);
  payload.append(entries.REFEICAO, REFEICAO_LABEL[dados.refeicao]);
  payload.append(entries.PERFIL, PERFIL_LABEL[dados.perfil]);
  if (entries.EMAIL) payload.append(entries.EMAIL, dados.email);
  payload.append('pageHistory', entries.PAGE_HISTORY);

  // @db.Date chega como meia-noite UTC: extrair em UTC evita voltar um dia.
  payload.append(
    `${entries.DATA}_year`,
    String(dados.dataReserva.getUTCFullYear()),
  );
  payload.append(
    `${entries.DATA}_month`,
    String(dados.dataReserva.getUTCMonth() + 1),
  );
  payload.append(`${entries.DATA}_day`, String(dados.dataReserva.getUTCDate()));

  return payload;
}

async function enviarFormulario(
  urlSubmit: string,
  payload: URLSearchParams,
): Promise<boolean> {
  try {
    const response = await fetch(urlSubmit, {
      method: 'POST',
      body: payload,
      signal: AbortSignal.timeout(TIMEOUT_ENVIO_MS),
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, 'Google Forms recusou o envio.');
    }

    return response.ok;
  } catch (err) {
    logger.error({ err }, 'Falha de rede ao enviar ao Google Forms.');
    return false;
  }
}

export async function submitReserva(
  dados: DadosSubmitReserva,
): Promise<boolean> {
  const ambiente = getAmbienteFormulario();
  const urlSubmit = derivarUrlSubmit(getFormularioUrl(ambiente));
  const payload = montarPayloadFormulario(dados, ambiente);

  return enviarFormulario(urlSubmit, payload);
}
