-- CreateEnum
CREATE TYPE "TipoCardapio" AS ENUM ('Almoço', 'Jantar', 'Almoço e Jantar');

-- CreateEnum
CREATE TYPE "Refeicao" AS ENUM ('Almoço', 'Jantar', 'Almoço e jantar');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('PENDENTE', 'AGENDADA', 'NAO_AGENDADA', 'INATIVA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('Aluno graduação UPF', 'Aluno pós-graduação UPF', 'Aluno Creati UPF', 'Aluno Integrado UPF', 'Professor ou Comunidade externa', 'Funcionário UPF', 'Residente multiprofissional', 'Estudante rede municipal/estadual');

-- CreateTable
CREATE TABLE "cardapio" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "tipo" "TipoCardapio" NOT NULL,
    "menu_do_dia" JSONB NOT NULL,
    "saladas" JSONB NOT NULL,
    "suco" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cardapio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_reserva" DATE NOT NULL,
    "refeicao" "Refeicao" NOT NULL,
    "processado" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusReserva" NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_historico" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserva_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "matricula" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cardapio_data_tipo_key" ON "cardapio"("data", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_usuario_id_data_reserva_key" ON "reservas"("usuario_id", "data_reserva");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_matricula_idx" ON "usuarios"("matricula");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_historico" ADD CONSTRAINT "reserva_historico_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
