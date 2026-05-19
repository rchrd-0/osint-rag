export const EMBED_BATCH_SIZE = 500;

export type EmbeddableChunk = {
  id: string;
  text: string;
};

export type EmbedRunOptions = {
  dryRun?: boolean;
  yes?: boolean;
};

export type EmbedRunLimits = {
  maxBatches?: number;
  maxChunks?: number;
};

export type PreflightSummary = {
  pending: number;
  cappedChunks: number;
  estimatedCalls: number;
};

export type BatchEmbedStats = {
  embedded: number;
  skipped: number;
  failed: number;
  tokens: number;
  cost: number | null;
};

export type PersistChunkEmbeddingParams = {
  chunkId: string;
  embedding: number[];
  model: string;
};
