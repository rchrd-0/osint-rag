import type { RagSource } from "@osint-rag/types";
import type { ChunkSearchResult } from "@/modules/search/search.repository";

export type RagQueryContext = {
  query: string;
  retrievalLimit: number;
  chunksPerDocument: number;
  retrievedChunks: ChunkSearchResult[];
  selectedChunks: ChunkSearchResult[];
  sources: RagSource[];
  context: string;
  prompt: string;
  retrievalLatencyMs: number;
};
