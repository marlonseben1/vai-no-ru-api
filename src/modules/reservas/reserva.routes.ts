import { Router } from 'express';
import { HttpStatus } from '../../constants/http-status.js';
import { requireUsuarioId } from '../../lib/auth-context.js';
import { ApiResponse } from '../../lib/http-response.js';
import { authenticate } from '../../middlewares/autenticate.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middlewares/validate.js';
import {
  criarReservasSchema,
  listarReservasQuerySchema,
  reservaIdParamsSchema,
} from './reserva.schemas.js';
import {
  cancelarReserva,
  criarReservas,
  getHistoricoReserva,
  listarReservas,
  reativarReserva,
} from './reserva.service.js';

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

router.delete(
  '/:id',
  authenticate,
  validateParams(reservaIdParamsSchema),
  async (req, res) => {
    const usuarioId = requireUsuarioId(req);
    const { id } = res.locals.params;
    await cancelarReserva(id, usuarioId);
    ApiResponse.success(res, { message: 'Reserva cancelada com sucesso' });
  },
);

router.put(
  '/:id',
  authenticate,
  validateParams(reservaIdParamsSchema),
  async (req, res) => {
    const usuarioId = requireUsuarioId(req);
    const { id } = res.locals.params;
    await reativarReserva(id, usuarioId);
    ApiResponse.success(res, { message: 'Reserva reativada com sucesso' });
  },
);

router.get(
  '/:id/historico',
  authenticate,
  validateParams(reservaIdParamsSchema),
  async (req, res) => {
    const usuarioId = requireUsuarioId(req);
    const { id } = res.locals.params;
    const historico = await getHistoricoReserva(id, usuarioId);
    ApiResponse.success(res, historico);
  },
);

export { router as reservaRoutes };
