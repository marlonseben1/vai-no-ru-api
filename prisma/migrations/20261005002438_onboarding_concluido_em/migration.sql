-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "onboarding_concluido_em" TIMESTAMP(3);

-- Backfill: quem já tem perfil (definido ao criar reservas) não refaz o onboarding
UPDATE "usuarios" SET "onboarding_concluido_em" = NOW() WHERE "perfil" IS NOT NULL;
