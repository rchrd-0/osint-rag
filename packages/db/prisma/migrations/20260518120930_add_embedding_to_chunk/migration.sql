-- AlterTable
ALTER TABLE "chunks" ADD COLUMN     "embedded_at" TIMESTAMP(3),
ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "embedding_model" TEXT;
