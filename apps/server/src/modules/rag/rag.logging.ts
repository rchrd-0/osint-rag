import type { RagSource } from "@osint-rag/types";
import type { generateText } from "ai";
import { persistQueryLogSafe } from "@/modules/query-log/query-log.service";
import type { ChunkSearchResult } from "@/modules/search/search.repository";
import { MODEL_ID, NO_ANSWER_TEXT } from "./rag.constants";

export type GenerateTextResult = Awaited<ReturnType<typeof generateText>>;

export const logRagNoResults = (params: { query: string; latencyMs: number }) =>
  persistQueryLogSafe({
    queryText: params.query,
    strategy: "fts",
    model: MODEL_ID,
    latencyMs: params.latencyMs,
    chunksRetrieved: 0,
    chunksUsed: 0,
    sourceCount: 0,
    cost: null,
    answer: NO_ANSWER_TEXT,
    success: true,
  });

export const logRagFailure = (params: {
  query: string;
  latencyMs: number;
  retrievedChunks: ChunkSearchResult[];
  selectedChunks: ChunkSearchResult[];
  sources: RagSource[];
  error: unknown;
}) =>
  persistQueryLogSafe({
    queryText: params.query,
    strategy: "fts",
    model: MODEL_ID,
    latencyMs: params.latencyMs,
    chunksRetrieved: params.retrievedChunks.length,
    chunksUsed: params.selectedChunks.length,
    sourceCount: params.sources.length,
    cost: null,
    answer: null,
    success: false,
    errorMessage: params.error instanceof Error ? params.error.message : String(params.error),
  });

export const logRagSuccess = (params: {
  query: string;
  latencyMs: number;
  retrievedChunks: ChunkSearchResult[];
  selectedChunks: ChunkSearchResult[];
  sources: RagSource[];
  result: GenerateTextResult;
}) => {
  const rawCost = params.result.usage?.raw?.cost;
  const cost = typeof rawCost === "number" ? rawCost : null;

  return persistQueryLogSafe({
    queryText: params.query,
    strategy: "fts",
    model: MODEL_ID,
    latencyMs: params.latencyMs,
    chunksRetrieved: params.retrievedChunks.length,
    chunksUsed: params.selectedChunks.length,
    sourceCount: params.sources.length,
    cost,
    answer: params.result.text,
    success: true,
    promptTokens: params.result.usage?.inputTokens,
    completionTokens: params.result.usage?.outputTokens,
    totalTokens: params.result.usage?.totalTokens,
    finishReason: params.result.finishReason,
  });
};
