import { Router } from 'express';
import { ApiResponse } from '../../lib/http-response.js';
import { authRateLimit } from '../../middlewares/rate-limit.js';
import { validateBody } from '../../middlewares/validate.js';
import { loginSchema } from './auth.schemas.js';
import { loginComGoogle } from './auth.service.js';

const router = Router();

router.post(
  '/google',
  authRateLimit,
  validateBody(loginSchema),
  async (req, res) => {
    const { token, usuario } = await loginComGoogle({
      googleToken: req.body.token,
      aceitarPolitica: req.body.aceitarPolitica,
    });

    ApiResponse.success(res, { token, usuario });
  },
);

export { router as authRoutes };
