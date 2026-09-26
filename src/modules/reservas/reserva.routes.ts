import { Router } from 'express';
import { HttpStatus } from '../../constants/http-status.js';
import { requireUsuarioId } from '../../lib/auth-context.js';
import { ApiResponse } from '../../lib/http-response.js';
import { authenticate } from '../../middlewares/autenticate.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import {
  criarReservasSchema,
  listarReservasQuerySchema,
} from './reserva.schemas.js';
import { criarReservas, listarReservas } from './reserva.service.js';

const router = Router();

router.post(
  '/',
  authenticate,
  validateBody(criarReservasSchema),
  async (req, res) => {
    const usuarioId = requireUsuarioId(req);
    const reservas = await criarReservas(usuarioId, req.body);
    ApiResponse.success(res, reservas, HttpStatus.CREATED);
  },
);

router.get(
  '/',
  authenticate,
  validateQuery(listarReservasQuerySchema),
  async (req, res) => {
    const usuarioId = requireUsuarioId(req);
    const resultado = await listarReservas(usuarioId, res.locals.query);
    ApiResponse.success(res, resultado);
  },
);

export { router as reservaRoutes };
