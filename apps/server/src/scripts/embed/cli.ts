import * as readline from "node:readline/promises";
import { parseArgs } from "node:util";
import {
  EMBED_BATCH_SIZE,
  type EmbedRunLimits,
  type EmbedRunOptions,
  type PreflightSummary,
} from "@/scripts/embed/types";

const EMBED_CLI_OPTIONS = {
  "dry-run": { type: "boolean" },
  yes: { type: "boolean", short: "y" },
} as const;

const parseOptionalPositiveInt = (value: string | undefined): number | undefined => {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(`Ignoring invalid positive integer env value: ${value}`);
    return undefined;
  }

  return parsed;
};

export const parseEmbedCliArgs = (): EmbedRunOptions => {
  const { values } = parseArgs({
    args: Bun.argv,
    options: EMBED_CLI_OPTIONS,
    strict: false,
  });

  return {
    dryRun: values["dry-run"] === true,
    yes: values.yes === true,
  };
};

export const readEmbedRunLimits = (): EmbedRunLimits => ({
  maxBatches: parseOptionalPositiveInt(Bun.env.MAX_EMBED_BATCHES),
  maxChunks: parseOptionalPositiveInt(Bun.env.MAX_EMBED_CHUNKS),
});

export const estimateEmbedApiCalls = (chunkCount: number, limits: EmbedRunLimits): number => {
  const batchCalls = Math.ceil(chunkCount / EMBED_BATCH_SIZE);
  if (limits.maxBatches !== undefined) {
    return Math.min(batchCalls, limits.maxBatches);
  }

  return batchCalls;
};

export const logEmbedPreflight = (params: {
  pending: number;
  limits: EmbedRunLimits;
  dryRun: boolean;
}): PreflightSummary | null => {
  const { pending, limits, dryRun } = params;

  if (pending === 0) {
    console.log("No chunks pending embedding.");
    return null;
  }

  const cappedChunks =
    limits.maxChunks !== undefined ? Math.min(pending, limits.maxChunks) : pending;
  const estimatedCalls = estimateEmbedApiCalls(cappedChunks, limits);

  console.log(`Pending embed: ${pending} chunk(s)`);
  console.log(
    `This run: up to ${cappedChunks} chunk(s), ~${estimatedCalls} embed API call(s) (batch size ${EMBED_BATCH_SIZE})`,
  );

  if (limits.maxBatches !== undefined) {
    console.log(`Cap: MAX_EMBED_BATCHES=${limits.maxBatches}`);
  }

  if (limits.maxChunks !== undefined) {
    console.log(`Cap: MAX_EMBED_CHUNKS=${limits.maxChunks}`);
  }

  if (dryRun) {
    console.log("DRY RUN — no embed API calls or database updates will be made.");
  }

  return { pending, cappedChunks, estimatedCalls };
};

export const confirmEmbedRun = async (params: {
  cappedChunks: number;
  estimatedCalls: number;
  yes: boolean;
}): Promise<boolean> => {
  if (params.yes) {
    return true;
  }

  if (!process.stdin.isTTY) {
    console.error("Non-interactive session: pass --yes to proceed without a prompt.");
    return false;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    const answer = await rl.question(
      `Proceed with up to ${params.cappedChunks} chunk(s) (~${params.estimatedCalls} API call(s))? [y/N] `,
    );

    return answer.trim().toLowerCase() === "y";
  } finally {
    rl.close();
  }
};

export const resolveEmbedBatchLimit = (
  chunksAttemptedThisRun: number,
  limits: EmbedRunLimits,
): number => {
  if (limits.maxChunks === undefined) {
    return EMBED_BATCH_SIZE;
  }

  const remainingChunkAllowance = limits.maxChunks - chunksAttemptedThisRun;
  if (remainingChunkAllowance <= 0) {
    return 0;
  }

  return Math.min(EMBED_BATCH_SIZE, remainingChunkAllowance);
};
