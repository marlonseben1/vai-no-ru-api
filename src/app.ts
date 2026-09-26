import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/config.js';
import { openApiDocument } from './docs/openapi.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { cardapioRoutes } from './modules/cardapio/cardapio.routes.js';
import { reservaRoutes } from './modules/reservas/reserva.routes.js';

export const app = express();

app.use(
  pinoHttp({
    logger,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      remove: true,
    },
  }),
);
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/v1/auth', authRoutes);
app.use('/v1/cardapio', cardapioRoutes);
app.use('v1/reservas', reservaRoutes);

if (env.NODE_ENV !== 'production') {
  app.get('/docs/openapi.json', (_req, res) => res.json(openApiDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

app.use(notFound);
app.use(errorHandler);
