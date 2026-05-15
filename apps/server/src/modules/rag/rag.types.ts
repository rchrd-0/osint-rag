import type { RagLatency, RagUsage } from "@osint-rag/types";
import type { ChunkSearchResult } from "@/modules/search/search.repository";

export type RagSourceRecord = {
  citation: number;
  documentId: string;
  title: string;
  url: string | null;
  publishedAt: Date | null;
  chunkIds: string[];
};

export type RagQueryContext = {
  query: string;
  retrievalLimit: number;
  chunksPerDocument: number;
  retrievedChunks: ChunkSearchResult[];
  selectedChunks: ChunkSearchResult[];
  sources: RagSourceRecord[];
  context: string;
  prompt: string;
  retrievalLatencyMs: number;
};

export type RagResult = {
  answer: string;
  retrievalLimit: number;
  chunksPerDocument: number;
  chunks: ChunkSearchResult[];
  sources: RagSourceRecord[];
  latency: RagLatency;
  usage?: RagUsage;
  finishReason?: string;
};
