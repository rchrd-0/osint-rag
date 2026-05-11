/*
  Warnings:

  - Made the column `external_id` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "external_id" SET NOT NULL;
