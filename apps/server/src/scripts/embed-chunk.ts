import prisma from "@osint-rag/db";
import { assertEmbeddingLength, EMBEDDING_MODEL_ID, embedTexts } from "@/lib/ai/embeddings";

const BATCH_SIZE = 50;

type EmbeddableChunk = {
  id: string;
  text: string;
};

const toPgVectorLiteral = (vector: number[]): string => {
  assertEmbeddingLength(vector);

  return `[${vector.join(",")}]`;
};

export const findUnembeddedChunks = async (limit = BATCH_SIZE): Promise<EmbeddableChunk[]> => {
  const chunks = await prisma.$queryRaw<EmbeddableChunk[]>`
    SELECT id, text
    FROM chunks
    WHERE (
      embedding IS NULL
      OR embedding_model IS DISTINCT FROM ${EMBEDDING_MODEL_ID}
    )
      AND length(trim(text)) > 0
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;

  return chunks;
};

export const persistChunkEmbedding = async (params: {
  chunkId: string;
  embedding: number[];
  model: string;
}): Promise<number> => {
  const vectorLiteral = toPgVectorLiteral(params.embedding);

  return await prisma.$executeRaw`
    UPDATE chunks
    SET
      embedding = ${vectorLiteral}::vector(1536),
      embedding_model = ${params.model},
      embedded_at = NOW()
    WHERE id = ${params.chunkId}
`;
};

type BatchEmbedStats = {
  embedded: number;
  skipped: number;
  failed: number;
};

export const embedAndPersistBatch = async (batch: EmbeddableChunk[]): Promise<BatchEmbedStats> => {
  const stats: BatchEmbedStats = { embedded: 0, skipped: 0, failed: 0 };

  if (!batch.length) {
    return stats;
  }

  const texts = batch.map((chunk) => chunk.text);
  const vectors = await embedTexts(texts);

  for (const [i, chunk] of batch.entries()) {
    const embedding = vectors[i];

    if (!embedding) {
      console.error(`${chunk.id}: failed - missing embedding at index ${i}`);
      stats.failed += 1;
      continue;
    }

    try {
      const rowsUpdated = await persistChunkEmbedding({
        chunkId: chunk.id,
        model: EMBEDDING_MODEL_ID,
        embedding,
      });

      if (rowsUpdated === 0) {
        stats.skipped += 1;
        console.log(`${chunk.id}: skipped (0 rows updated)`);
      } else {
        stats.embedded += 1;
        console.log(`${chunk.id}: embedded`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`${chunk.id}: failed -`, errorMessage);
      stats.failed += 1;
    }
  }

  return stats;
};

export const runBatchEmbedChunks = async (): Promise<void> => {
  let totalEmbedded = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let batchNum = 0;

  while (true) {
    const batch = await findUnembeddedChunks(BATCH_SIZE);
    if (!batch.length) {
      break;
    }

    batchNum += 1;
    let batchEmbedded = 0;
    let batchFailed = 0;
    let batchSkipped = 0;

    console.log(`Batch ${batchNum}: processing ${batch.length} chunks`);

    try {
      const stats = await embedAndPersistBatch(batch);
      batchEmbedded = stats.embedded;
      batchSkipped = stats.skipped;
      batchFailed = stats.failed;
      totalEmbedded += stats.embedded;
      totalSkipped += stats.skipped;
      totalFailed += stats.failed;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Batch ${batchNum}: embed API failed -`, errorMessage);
      batchFailed = batch.length;
      totalFailed += batch.length;
    }

    console.log(
      `Batch ${batchNum} done: ${batchEmbedded} embedded, ${batchSkipped} skipped, ${batchFailed} failed`,
    );
    console.log(
      `Running totals: ${totalEmbedded} embedded, ${totalSkipped} skipped, ${totalFailed} failed`,
    );

    if (batchEmbedded === 0) {
      console.error(
        `No chunks embedded in batch ${batchNum}; stopping to avoid retrying the same failures indefinitely.`,
      );
      break;
    }
  }

  console.log(`
Batches processed: ${batchNum}
Total embedded:    ${totalEmbedded}
Total skipped:     ${totalSkipped}
Total failed:      ${totalFailed}
`);
};

await runBatchEmbedChunks()
  .catch((error) => {
    console.error("An error occurred during embedding: ", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
