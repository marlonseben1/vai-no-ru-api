import * as SentrySdk from '@sentry/node';
import { env } from '../config/config.js';

type Tags = Record<string, string | number | undefined>;

const ativo = Boolean(env.SENTRY_DSN);

SentrySdk.init({
  dsn: env.SENTRY_DSN,
  enabled: ativo,
  environment: env.FORM_AMBIENTE ?? env.NODE_ENV,
});

function capturar(erro: unknown, tags: Tags = {}): void {
  if (!ativo) return;

  SentrySdk.withScope((scope) => {
    for (const [chave, valor] of Object.entries(tags)) {
      if (valor !== undefined) scope.setTag(chave, String(valor));
    }
    SentrySdk.captureException(erro);
  });
}

async function flush(timeoutMs = 2000): Promise<void> {
  if (ativo) await SentrySdk.flush(timeoutMs);
}

export const sentry = { capturar, flush };
