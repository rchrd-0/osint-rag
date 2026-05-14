import type { RagUsage } from "@osint-rag/types";
import type { ChunkSearchResult } from "@/modules/search/search.repository";

export type RagSourceRecord = {
  citation: number;
  documentId: string;
  title: string;
  url: string | null;
  publishedAt: Date | null;
  chunkIds: string[];
};

export type RagResult = {
  answer: string;
  retrievalLimit: number;
  chunksPerDocument: number;
  chunks: ChunkSearchResult[];
  sources: RagSourceRecord[];
  latency: {
    retrievalMs: number;
    generationMs: number;
    totalMs: number;
  };
  usage?: RagUsage;
  finishReason?: string;
};
