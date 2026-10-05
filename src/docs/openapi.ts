import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import {
  loginResponseSchema,
  loginSchema,
  onboardingSchema,
  usuarioPublicoSchema,
} from '../modules/auth/auth.schemas.js';
import {
  cardapioItemSchema,
  listarCardapioQuerySchema,
} from '../modules/cardapio/cardapio.schemas.js';
import {
  criarReservasSchema,
  listarReservasQuerySchema,
  reservaIdParamsSchema,
} from '../modules/reservas/reserva.schemas.js';
import { errorResponseSchema } from './schemas.js';

const reservaItemSchema = z
  .object({
    id: z.string(),
    dataReserva: z.string(),
    refeicao: z.string(),
    status: z.string(),
    createdAt: z.string(),
  })
  .meta({ id: 'ReservaItem' });

const reservaHistoricoItemSchema = z
  .object({
    id: z.string(),
    reservaId: z.string(),
    acao: z.string(),
    createdAt: z.string(),
  })
  .meta({ id: 'ReservaHistoricoItem' });

const listarReservasResponseSchema = z
  .object({
    data: z.array(reservaItemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .meta({ id: 'ListarReservasResponse' });

const mensagemResponseSchema = z
  .object({ message: z.string() })
  .meta({ id: 'MensagemResponse' });

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
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'vairu_session' },
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
              'Consentimento pendente ou conta de convidado aguardando aprovação.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '429': {
            description: 'Muitas tentativas em um curto período.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Retorna o usuário da sessão atual',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Sessão válida.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: z.object({ usuario: usuarioPublicoSchema }),
                }),
              },
            },
          },
          '401': {
            description: 'Sessão ausente ou expirada.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },
    '/auth/onboarding': {
      post: {
        tags: ['Auth'],
        summary: 'Conclui o onboarding salvando nome, perfil e matrícula',
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: onboardingSchema } },
        },
        responses: {
          '200': {
            description: 'Onboarding concluído.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: z.object({ usuario: usuarioPublicoSchema }),
                }),
              },
            },
          },
          '401': {
            description: 'Sessão ausente ou expirada.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '422': {
            description:
              'Dados inválidos, incluindo perfil incompatível com o tipo da conta.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Encerra a sessão atual',
        responses: {
          '200': {
            description: 'Sessão encerrada.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: mensagemResponseSchema,
                }),
              },
            },
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

    '/reservas': {
      post: {
        tags: ['Reservas'],
        summary: 'Cria reservas para um ou mais dias',
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: criarReservasSchema } },
        },
        responses: {
          '201': {
            description: 'Reservas criadas com sucesso.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: z.array(reservaItemSchema),
                }),
              },
            },
          },
          '401': {
            description: 'Token ausente ou inválido.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '403': {
            description:
              'Onboarding não concluído (código ONBOARDING_REQUIRED).',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '422': {
            description:
              'Dados inválidos, incluindo reserva para hoje fora do prazo (almoço e almoço + jantar até 09:30; jantar até 15:30).',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
      get: {
        tags: ['Reservas'],
        summary: 'Lista as reservas do usuário autenticado',
        security: [{ cookieAuth: [] }],
        requestParams: { query: listarReservasQuerySchema },
        responses: {
          '200': {
            description: 'Lista paginada de reservas.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: listarReservasResponseSchema,
                }),
              },
            },
          },
          '401': {
            description: 'Token ausente ou inválido.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '422': {
            description: 'Parâmetros de busca inválidos.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },

    '/reservas/{id}': {
      delete: {
        tags: ['Reservas'],
        summary: 'Cancela uma reserva',
        security: [{ cookieAuth: [] }],
        requestParams: { path: reservaIdParamsSchema },
        responses: {
          '200': {
            description: 'Reserva cancelada com sucesso.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: mensagemResponseSchema,
                }),
              },
            },
          },
          '404': {
            description: 'Reserva não encontrada.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '409': {
            description: 'Esta reserva não pode ser cancelada.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
      put: {
        tags: ['Reservas'],
        summary: 'Reativa uma reserva cancelada',
        security: [{ cookieAuth: [] }],
        requestParams: { path: reservaIdParamsSchema },
        responses: {
          '200': {
            description: 'Reserva reativada com sucesso.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: mensagemResponseSchema,
                }),
              },
            },
          },
          '404': {
            description: 'Reserva não encontrada.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
          '409': {
            description: 'Esta reserva não pode ser reativada.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },

    '/reservas/{id}/historico': {
      get: {
        tags: ['Reservas'],
        summary: 'Lista o histórico de ações de uma reserva',
        security: [{ cookieAuth: [] }],
        requestParams: { path: reservaIdParamsSchema },
        responses: {
          '200': {
            description: 'Histórico de ações da reserva.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.literal(true),
                  data: z.array(reservaHistoricoItemSchema),
                }),
              },
            },
          },
          '404': {
            description: 'Reserva não encontrada.',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
    },
  },
});
