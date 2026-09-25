import { Router } from 'express';
import { ApiResponse } from '../../lib/http-response.js';
import { validateQuery } from '../../middlewares/validate.js';
import { listarCardapioQuerySchema } from './cardapio.schemas.js';
import { listarCardapio } from './cardapio.service.js';

const router = Router();

router.get('/', validateQuery(listarCardapioQuerySchema), async (_req, res) => {
  const { dataInicio, dataFim } = res.locals.query;
  const cardapio = await listarCardapio({ dataInicio, dataFim });
  ApiResponse.success(res, cardapio);
});

export { router as cardapioRoutes };
