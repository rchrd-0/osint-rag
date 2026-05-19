import prisma from "@osint-rag/db";
import { assertEmbeddingLength, EMBEDDING_MODEL_ID, embedText } from "@/lib/ai/embeddings";

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

export const embedChunk = async (chunk: EmbeddableChunk): Promise<number> => {
  const embedding = await embedText(chunk.text);

  return await persistChunkEmbedding({
    chunkId: chunk.id,
    model: EMBEDDING_MODEL_ID,
    embedding,
  });
};

export const runBatchEmbedChunks = async () => {
  const unembeddedChunks = await findUnembeddedChunks(BATCH_SIZE);

  console.log(`Found ${unembeddedChunks.length} unembedded chunks`);

  const chunksFound = unembeddedChunks.length;
  let chunksEmbedded = 0;
  let chunksSkipped = 0;
  let chunksFailed = 0;

  for (const chunk of unembeddedChunks) {
    try {
      const rowsUpdated = await embedChunk(chunk);

      if (rowsUpdated === 0) {
        chunksSkipped += 1;
      } else {
        chunksEmbedded += 1

        console.log(`${chunk.id}: embedded`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`${chunk.id}: failed - `, errorMessage);

      chunksFailed += 1;
    }
  }

  console.log(`
Chunks found:      ${chunksFound}
Chunks embedded:   ${chunksEmbedded}
Chunks skipped:    ${chunksSkipped}
Chunks failed:     ${chunksFailed}
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
