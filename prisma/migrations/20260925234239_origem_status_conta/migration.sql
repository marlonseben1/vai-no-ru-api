/*
  Warnings:

  - Added the required column `origem` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrigemConta" AS ENUM ('UPF', 'CONVIDADO');

-- CreateEnum
CREATE TYPE "StatusConta" AS ENUM ('PENDENTE_APROVACAO', 'ATIVO');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "origem" "OrigemConta" NOT NULL,
ADD COLUMN     "status" "StatusConta" NOT NULL DEFAULT 'PENDENTE_APROVACAO',
ALTER COLUMN "perfil" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "usuarios_status_idx" ON "usuarios"("status");
