import { Router } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../../lib/http-response.js';
import { validateQuery } from '../../middlewares/validate.js';
import { listarCardapio } from './cardapio.service.js';

const router = Router();

const listarCardapioQuerySchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

router.get('/', validateQuery(listarCardapioQuerySchema), async (_req, res) => {
  const { dataInicio, dataFim } = res.locals.query;
  const cardapio = await listarCardapio({ dataInicio, dataFim });
  ApiResponse.success(res, cardapio);
});

export { router as cardapioRoutes };
