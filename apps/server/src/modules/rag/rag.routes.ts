import { type RagQueryInput, ragQuerySchema } from "@osint-rag/schemas";
import type { RagChunk, RagDebugQueryResponse, RagQueryResponse } from "@osint-rag/types";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import { runRagQuery } from "@/modules/rag/rag.service";
import type { RagResult } from "@/modules/rag/rag.types";
import { publishedAtToIso } from "@/utils/format";

const ragRoutes = new Hono();

const toRagChunks = (result: RagResult): RagChunk[] =>
  result.chunks.map((chunk) => ({
    id: chunk.id,
    documentId: chunk.documentId,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    document: {
      url: chunk.document.url,
      title: chunk.document.title,
      publishedAt: publishedAtToIso(chunk.document.publishedAt),
    },
    rank: chunk.rank ?? null,
  }));

const toRagSources = (result: RagResult) =>
  result.sources.map((source) => ({
    ...source,
    publishedAt: publishedAtToIso(source.publishedAt),
  }));

const toRagQueryResponse = (result: RagResult): RagQueryResponse => ({
  answer: result.answer,
  sources: toRagSources(result),
  meta: {
    strategy: "fts",
    noResults: result.chunks.length === 0,
    sourceCount: result.sources.length,
    latency: result.latency,
  },
});

const toRagDebugQueryResponse = (
  input: RagQueryInput,
  result: RagResult,
): RagDebugQueryResponse => ({
  answer: result.answer,
  chunks: toRagChunks(result),
  sources: toRagSources(result),
  meta: {
    query: input.query,
    strategy: "fts",
    requestedLimit: input.limit,
    retrievalLimit: result.retrievalLimit,
    used: result.chunks.length,
    chunksPerDocument: result.chunksPerDocument,
    noResults: result.chunks.length === 0,
    sourceCount: result.sources.length,
    latency: result.latency,
    usage: result.usage,
    finishReason: result.finishReason,
  },
});

ragRoutes.post("/query", validator("json", ragQuerySchema), async (c) => {
  const result = await runRagQuery(c.req.valid("json"));
  const data = toRagQueryResponse(result);

  return c.json({
    success: true,
    data,
  });
});

ragRoutes.post("/query/debug", validator("json", ragQuerySchema), async (c) => {
  const input = c.req.valid("json");
  const result = await runRagQuery(input);
  const data = toRagDebugQueryResponse(input, result);

  return c.json({
    success: true,
    data,
  });
});

export default ragRoutes;
