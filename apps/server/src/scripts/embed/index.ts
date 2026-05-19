import prisma from "@osint-rag/db";
import { assertEmbeddingLength, EMBEDDING_MODEL_ID, embedTexts } from "@/lib/ai/embeddings";
import {
  confirmEmbedRun,
  logEmbedPreflight,
  parseEmbedCliArgs,
  readEmbedRunLimits,
  resolveEmbedBatchLimit,
} from "@/scripts/embed/cli";
import {
  type BatchEmbedStats,
  EMBED_BATCH_SIZE,
  type EmbeddableChunk,
  type EmbedRunOptions,
  type PersistChunkEmbeddingParams,
} from "@/scripts/embed/types";
import { formatTokenCount, formatTokensAndCost, formatUsdAmountOrUnknown } from "@/utils/format";

const toPgVectorLiteral = (vector: number[]): string => {
  assertEmbeddingLength(vector);

  return `[${vector.join(",")}]`;
};

export const countUnembeddedChunks = async (): Promise<number> => {
  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT count(*)::bigint AS count
    FROM chunks
    WHERE (
      embedding IS NULL
      OR embedding_model IS DISTINCT FROM ${EMBEDDING_MODEL_ID}
    )
      AND length(trim(text)) > 0
  `;

  return Number(result[0]?.count ?? 0);
};

export const findUnembeddedChunks = async (
  limit = EMBED_BATCH_SIZE,
): Promise<EmbeddableChunk[]> => {
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

export const persistChunkEmbedding = async (
  params: PersistChunkEmbeddingParams,
): Promise<number> => {
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

export const embedAndPersistBatch = async (batch: EmbeddableChunk[]): Promise<BatchEmbedStats> => {
  const stats: BatchEmbedStats = { embedded: 0, skipped: 0, failed: 0, tokens: 0, cost: null };

  if (!batch.length) {
    return stats;
  }

  const texts = batch.map((chunk) => chunk.text);
  const { embeddings: vectors, tokens, cost } = await embedTexts(texts);
  stats.tokens = tokens;
  stats.cost = cost;

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

export const runBatchEmbedChunks = async (options: EmbedRunOptions = {}): Promise<number> => {
  const { dryRun = false, yes = false } = options;
  const limits = readEmbedRunLimits();
  const pendingAtStart = await countUnembeddedChunks();

  const preflight = logEmbedPreflight({ pending: pendingAtStart, limits, dryRun });

  if (pendingAtStart === 0 || dryRun || !preflight) {
    return 0;
  }

  const confirmed = await confirmEmbedRun({
    cappedChunks: preflight.cappedChunks,
    estimatedCalls: preflight.estimatedCalls,
    yes,
  });

  if (!confirmed) {
    console.log("Aborted.");
    return 0;
  }

  let totalEmbedded = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalTokens = 0;
  let totalCost = 0;
  let hasKnownCost = false;
  let batchNum = 0;
  let chunksAttemptedThisRun = 0;
  let stoppedByCap = false;

  while (true) {
    if (limits.maxBatches !== undefined && batchNum >= limits.maxBatches) {
      stoppedByCap = true;
      console.warn(
        `Stopped: reached MAX_EMBED_BATCHES (${limits.maxBatches}). Re-run to continue.`,
      );
      break;
    }

    const batchLimit = resolveEmbedBatchLimit(chunksAttemptedThisRun, limits);
    if (batchLimit === 0) {
      stoppedByCap = true;
      console.warn(`Stopped: reached MAX_EMBED_CHUNKS (${limits.maxChunks}). Re-run to continue.`);
      break;
    }

    const batch = await findUnembeddedChunks(batchLimit);
    if (!batch.length) {
      break;
    }

    batchNum += 1;
    chunksAttemptedThisRun += batch.length;
    let batchEmbedded = 0;
    let batchFailed = 0;
    let batchSkipped = 0;
    let batchTokens = 0;
    let batchCost: number | null = null;

    console.log(`Batch ${batchNum}: processing ${batch.length} chunks`);

    try {
      const stats = await embedAndPersistBatch(batch);
      batchEmbedded = stats.embedded;
      batchSkipped = stats.skipped;
      batchFailed = stats.failed;
      batchTokens = stats.tokens;
      batchCost = stats.cost;
      totalEmbedded += stats.embedded;
      totalSkipped += stats.skipped;
      totalFailed += stats.failed;
      totalTokens += stats.tokens;
      if (stats.cost !== null) {
        totalCost += stats.cost;
        hasKnownCost = true;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `Batch ${batchNum}: embed API failed -`,
        errorMessage,
        `(chunk ids: ${batch.map((chunk) => chunk.id).join(", ")})`,
      );
      batchFailed = batch.length;
      totalFailed += batch.length;
    }

    const batchCostLine = formatTokensAndCost({ cost: batchCost, tokens: batchTokens });

    console.log(
      `Batch ${batchNum} done: ${batchEmbedded} embedded, ${batchSkipped} skipped, ${batchFailed} failed (${batchCostLine})`,
    );
    console.log(
      `Running totals: ${totalEmbedded} embedded, ${totalSkipped} skipped, ${totalFailed} failed (${formatTokensAndCost({ cost: hasKnownCost ? totalCost : null, tokens: totalTokens })})`,
    );

    if (batchEmbedded === 0) {
      console.error(
        `No chunks embedded in batch ${batchNum}; stopping to avoid retrying the same failures indefinitely.`,
      );
      break;
    }
  }

  const remaining = await countUnembeddedChunks();

  const totalCostLine = formatUsdAmountOrUnknown(hasKnownCost ? totalCost : null);
  const totalTokensLine = formatTokenCount(totalTokens);

  console.log(`
Batches processed: ${batchNum}
Total embedded:    ${totalEmbedded}
Total skipped:     ${totalSkipped}
Total failed:      ${totalFailed}
Total tokens:      ${totalTokensLine}
Total cost:        ${totalCostLine}
Remaining:         ${remaining}
`);

  if (remaining > 0) {
    if (stoppedByCap) {
      console.error(`${remaining} chunk(s) still need embedding (stopped early due to caps).`);
    } else {
      console.error(`${remaining} chunk(s) still need embedding.`);
    }

    return 1;
  }

  if (totalFailed > 0) {
    console.error("Run finished with failures but no remaining NULL embeddings to match filter.");
    return 1;
  }

  return 0;
};

const cli = parseEmbedCliArgs();

const exitCode = await runBatchEmbedChunks(cli).catch((error) => {
  console.error("An error occurred during embedding: ", error);
  return 1;
});

process.exitCode = exitCode;

await prisma.$disconnect();
