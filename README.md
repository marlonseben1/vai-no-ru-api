# Vai no RU API

API em Express para agendamento de refeições no Restaurante Universitário (RU) da UPF.

O usuário entra com a conta Google, conclui o onboarding e cria reservas de almoço e/ou jantar. Um cron job envia essas reservas ao Google Forms oficial do RU no horário limite de cada janela (segunda a sexta):

| Janela | Horário | Refeições cobertas       |
| ------ | ------- | ------------------------ |
| MANHÃ  | 09:30   | Almoço e Almoço + Jantar |
| TARDE  | 15:30   | Jantar                   |

Cada janela tem novas tentativas (retries) 5 e 10 minutos depois.

## Rotas

| Método | Rota                         | Auth | Descrição                                                                                                                          |
| ------ | ---------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/auth/google`            | Não  | Login com token do Google (define o cookie `vairu_session`)                                                                        |
| GET    | `/v1/auth/me`                | Sim  | Usuário autenticado                                                                                                                |
| POST   | `/v1/auth/onboarding`        | Sim  | Conclui o cadastro (`nome`, `perfil`)                                                                                              |
| POST   | `/v1/auth/logout`            | Não  | Encerra a sessão                                                                                                                   |
| GET    | `/v1/cardapio`               | Não  | Cardápio (query `dataInicio` e `dataFim`)                                                                                          |
| POST   | `/v1/reservas`               | Sim  | Cria reservas. Body: `{ "dias": [{ "data": "YYYY-MM-DD", "refeicao": "Almoco" }] }`                                                |
| GET    | `/v1/reservas`               | Sim  | Lista com paginação e filtros (`page`, `pageSize`, `sort`, `order`, `dataFiltro`, `dataInicio`, `dataFim`, `refeicao`, `situacao`) |
| PUT    | `/v1/reservas/:id`           | Sim  | Reativa uma reserva                                                                                                                |
| DELETE | `/v1/reservas/:id`           | Sim  | Cancela uma reserva                                                                                                                |
| GET    | `/v1/reservas/:id/historico` | Sim  | Histórico de ações da reserva                                                                                                      |
| GET    | `/health`                    | Não  | Health check                                                                                                                       |

## Tecnologias

- **Linguagem/runtime:** TypeScript, Node.js 24 (ESM)
- **Framework:** Express 5, com Helmet, CORS, cookie-parser e express-rate-limit
- **Banco de dados:** PostgreSQL 17
- **ORM:** Prisma 7 (com `@prisma/adapter-pg`)
- **Validação e documentação:** Zod, zod-openapi e Swagger UI
- **Autenticação:** Google OAuth (`google-auth-library`) e JWT em cookie httpOnly
- **Agendamento:** node-cron
- **Logs:** Pino
- **Qualidade:** Biome (lint e formatação)
- **Gerenciador de pacotes:** pnpm
- **Infra:** Docker, Docker Compose e GitHub Actions (CI)

## Pré-requisitos

- Node.js 24
- pnpm (`corepack enable`)
- Docker e Docker Compose

## Como executar

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Crie o arquivo de variáveis de ambiente e preencha os valores (veja a seção abaixo):

   ```bash
   cp .env.example .env
   ```

3. Suba o PostgreSQL (porta `5433` no host):

   ```bash
   pnpm db:up
   ```

4. Gere o client do Prisma e rode as migrations:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. (Opcional) Popule o banco com cardápio e reservas de exemplo:

   ```bash
   pnpm db:seed
   ```

6. Inicie a API em modo desenvolvimento:

   ```bash
   pnpm dev
   ```

A API fica disponível em `http://localhost:3003` (verifique em `http://localhost:3003/health`).

### Produção

```bash
pnpm build
pnpm db:migrate:deploy
pnpm start
```

Também é possível usar o `Dockerfile` (expõe a porta `3003`):

```bash
docker build -t vai-no-ru-api .
docker run --env-file .env -p 3003:3003 vai-no-ru-api
```

## Variáveis de ambiente

Copie `.env.example` para `.env`. O arquivo de exemplo não contém credenciais reais.

| Variável                  | Obrigatória | Descrição                                     |
| ------------------------- | ----------- | --------------------------------------------- |
| `NODE_ENV`                | sim         | `development`, `test` ou `production`         |
| `PORT`                    | não         | Porta da API (padrão `3003`)                  |
| `DATABASE_URL`            | sim         | URL de conexão do PostgreSQL                  |
| `GOOGLE_CLIENT_ID`        | sim         | Client ID do Google OAuth                     |
| `JWT_SECRET`              | sim         | Segredo do JWT, mínimo de 32 caracteres       |
| `WEB_URL`                 | sim         | URL do front-end (usada no CORS)              |
| `GOOGLE_FORM_URL_STAGING` | não         | Formulário de testes (usado fora de produção) |
| `GOOGLE_FORM_URL_PROD`    | em produção | Formulário oficial do RU                      |
| `ENABLE_JOBS`             | não         | Liga/desliga os cron jobs (padrão `true`)     |

Observações:

- A URL do formulário deve terminar em `/viewform`. Links `forms.gle` não funcionam.
- Fora de produção, os envios do cron vão para o formulário de **staging**. Use `ENABLE_JOBS=false` se não quiser enviar nada.

## Swagger

Com a API rodando em desenvolvimento, a documentação interativa fica em:

**http://localhost:3003/docs**

O JSON OpenAPI está em `http://localhost:3003/docs/openapi.json`. As rotas de documentação ficam desativadas quando `NODE_ENV=production`.

## Testes

O projeto ainda **não possui testes automatizados**.

As verificações disponíveis, também executadas na CI, são:

```bash
pnpm typecheck
pnpm lint
```

Para testes manuais da API, use a coleção [Bruno](https://www.usebruno.com/) em `bruno/`.

## Scripts úteis

| Comando                            | Descrição                                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| `pnpm db:studio`                   | Abre o Prisma Studio                                       |
| `pnpm db:down`                     | Derruba o PostgreSQL                                       |
| `pnpm db:logs`                     | Logs do PostgreSQL                                         |
| `pnpm format`                      | Formata o código com Biome                                 |
| `pnpm job:executar [MANHA\|TARDE]` | Executa manualmente o job de envio (bloqueado em produção) |

## Estrutura do projeto

```
src/
  config/        validação das variáveis de ambiente
  jobs/          cron jobs de envio ao formulário
  lib/           utilitários (JWT, cookies, datas, logger, erros)
  middlewares/   autenticação, validação, rate limit, erros
  modules/       auth, cardapio, reservas, formulario
  docs/          documento OpenAPI
prisma/
  schema/        modelos (Usuario, Reserva, ReservaHistorico, Cardapio)
  migrations/    migrations
  seed/          dados de exemplo
bruno/           coleção de requests
```
