/*
  Warnings:

  - A unique constraint covering the columns `[source_type,external_id]` on the table `documents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "documents_source_type_external_id_key" ON "documents"("source_type", "external_id");
