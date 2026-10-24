import { Router } from 'express';
import { requireUsuarioId } from '../../lib/auth-context.js';
import { ApiResponse } from '../../lib/http-response.js';
import { authenticate } from '../../middlewares/autenticate.js';
import { validateBody } from '../../middlewares/validate.js';
import { registrarCesSchema } from './ces.schemas.js';
import { getPodeMostrarCes, registrarCes } from './ces.service.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const usuarioId = requireUsuarioId(req);
  const exibirPesquisa = await getPodeMostrarCes(usuarioId);
  ApiResponse.success(res, { exibirPesquisa });
});

router.post(
  '/',
  authenticate,
  validateBody(registrarCesSchema),
  async (req, res) => {
    const usuarioId = requireUsuarioId(req);
    await registrarCes(usuarioId, req.body);
    ApiResponse.created(res, { message: 'Avaliação registrada.' });
  },
);

export { router as cesRoutes };
