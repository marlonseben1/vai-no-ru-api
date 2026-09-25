import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import {
  loginResponseSchema,
  loginSchema,
} from '../modules/auth/auth.schemas.js';
import {
  cardapioItemSchema,
  listarCardapioQuerySchema,
} from '../modules/cardapio/cardapio.schemas.js';
import { errorResponseSchema } from './schemas.js';

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Vai no Ru API',
    version: '1.0.0',
    description: 'API para automação de reservas no RU da UPF',
  },
  servers: [{ url: '/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Login com Google',
        requestBody: {
          content: { 'application/json': { schema: loginSchema } },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: loginResponseSchema,
                }),
              },
            },
          },
          '401': {
            description: 'Token do Google inválido ou usuário não cadastrado.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '403': {
            description:
              'Consentimento com a política de privacidade necessário.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '429': {
            description: 'Muitas tentativas em um curto período.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },
    '/cardapio': {
      get: {
        tags: ['Cardápio'],
        summary: 'Lista o cardápio do RU',
        requestParams: { query: listarCardapioQuerySchema },
        responses: {
          '200': {
            description: 'Lista de cardápios no intervalo solicitado.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: z.array(cardapioItemSchema),
                }),
              },
            },
          },
          '422': {
            description: 'Parâmetros de busca inválidos.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },
  },
});
