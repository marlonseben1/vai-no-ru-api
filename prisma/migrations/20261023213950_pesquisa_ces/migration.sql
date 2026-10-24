-- CreateTable
CREATE TABLE "pesquisas_ces" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nota" INTEGER,
    "comentario" TEXT,
    "contexto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesquisas_ces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pesquisas_ces_usuario_id_idx" ON "pesquisas_ces"("usuario_id");

-- AddForeignKey
ALTER TABLE "pesquisas_ces" ADD CONSTRAINT "pesquisas_ces_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
