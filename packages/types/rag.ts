import type { QueryStrategy } from "@osint-rag/schemas";

export type RagLatency = {
  retrievalMs: number;
  generationMs: number;
  totalMs: number;
};

export type RagSource = {
  citation: number;
  documentId: string;
  title: string;
  url: string | null;
  publishedAt: string | null;
  chunkIds: string[];
};

export type RagChunkDocument = {
  url: string | null;
  title: string;
  publishedAt: string | null;
};

export type RagChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  document: RagChunkDocument;
  rank: number | null;
};

export type RagUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  raw?: { cost?: number; [key: string]: unknown };
};

export type RagQueryMeta = {
  strategy: QueryStrategy;
  noResults: boolean;
  sourceCount: number;
  latency: RagLatency;
};

export type RagDebugMeta = {
  query: string;
  strategy: QueryStrategy;
  requestedLimit: number;
  retrievalLimit: number;
  used: number;
  chunksPerDocument: number;
  noResults: boolean;
  sourceCount: number;
  latency: RagLatency;
  usage?: RagUsage;
  finishReason?: string;
};

export type RagQueryResponse = {
  answer: string;
  sources: RagSource[];
  meta: RagQueryMeta;
};

export type RagDebugQueryResponse = RagQueryResponse & {
  chunks: RagChunk[];
  meta: RagDebugMeta;
};
