-- DropIndex
DROP INDEX "usuarios_matricula_idx";

-- A matrícula passa a ser deduzida do e-mail institucional (123456@upf.br).
-- Normaliza os alunos existentes antes de criar a unicidade.
UPDATE "usuarios"
SET "matricula" = split_part("email", '@', 1)
WHERE "perfil" = 'Aluno graduação UPF'
  AND "email" ~* '^[0-9]+@upf\.br$';

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_matricula_key" ON "usuarios"("matricula");
