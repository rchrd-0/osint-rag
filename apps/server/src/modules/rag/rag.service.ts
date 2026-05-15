import type { RagQueryInput } from "@osint-rag/schemas";
import type { RagUsage } from "@osint-rag/types";
import { generateText } from "ai";
import { openrouter } from "@/lib/ai/openrouter";
import { type ChunkSearchResult, searchChunksFullText } from "@/modules/search/search.repository";
import { MODEL_ID, NO_ANSWER_TEXT } from "./rag.constants";
import {
  type GenerateTextResult,
  logRagFailure,
  logRagNoResults,
  logRagSuccess,
} from "./rag.logging";
import type { RagQueryContext, RagResult, RagSourceRecord } from "./rag.types";

const OVERFETCH_FACTOR = 3;
const SYSTEM_PROMPT = `You are an OSINT research assistant.

Answer the user's question using only the provided context.
If the context does not contain enough information, say:
"I don't have enough information from the provided sources."

Rules:
-   Answer the question directly in the first sentence.
-   Do not invent facts, names, dates, or causal relationships.
-   Only cite source numbers that appear in the provided context, using [1], [2], etc.
-   Distinguish clearly between reported claims, expert concerns, and established facts.
-   If the sources are uncertain, conflicting, or anecdotal, say so briefly.
-   Do not overstate causation when the sources only suggest correlation, concern, or allegation.
-   Keep the answer concise, factual, and neutral.
-   Prefer a short paragraph followed by 2-4 bullet points only if helpful.`;

const toRagUsage = (usage?: {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  raw?: unknown;
}): RagUsage | undefined => {
  if (!usage) {
    return undefined;
  }

  const { inputTokens, outputTokens, totalTokens, raw } = usage;

  if (raw !== undefined && raw !== null && typeof raw === "object") {
    return {
      inputTokens,
      outputTokens,
      totalTokens,
      raw: raw as RagUsage["raw"],
    };
  }

  return { inputTokens, outputTokens, totalTokens };
};

// 1. retrieval helper
// get ranked chunks, raw
// call search.repo FTS
const getRankedChunks = async (query: string, limit: number): Promise<ChunkSearchResult[]> => {
  return await searchChunksFullText(query, limit);
};

// 2. postprocess, diversity helper
// cap max chunks per document
// trim to final limit
const capChunksPerDocument = (
  chunks: ChunkSearchResult[],
  chunksPerDocument = 2,
): ChunkSearchResult[] => {
  const chunkCountByDocumentId = new Map<string, number>();

  const results: ChunkSearchResult[] = [];
  for (const chunk of chunks) {
    const currentCount = chunkCountByDocumentId.get(chunk.documentId) ?? 0;

    if (currentCount >= chunksPerDocument) {
      continue;
    }

    chunkCountByDocumentId.set(chunk.documentId, currentCount + 1);
    results.push(chunk);
  }

  return results;
};

// 3. source mapper/builder
// derive unique source list
// one source entry per distinct document
// for client display
const buildSources = (chunks: ChunkSearchResult[]): RagSourceRecord[] => {
  const sourceByDocumentId = new Map<string, RagSourceRecord>();

  for (const chunk of chunks) {
    const existing = sourceByDocumentId.get(chunk.documentId);

    if (existing) {
      existing.chunkIds.push(chunk.id);
      continue;
    }

    sourceByDocumentId.set(chunk.documentId, {
      citation: sourceByDocumentId.size + 1,
      documentId: chunk.documentId,
      title: chunk.document.title,
      url: chunk.document.url,
      publishedAt: chunk.document.publishedAt,
      chunkIds: [chunk.id],
    });
  }

  return Array.from(sourceByDocumentId.values());
};

// 4. build context
const buildContext = (chunks: ChunkSearchResult[], sources: RagSourceRecord[]): string => {
  const citationByDocumentId = new Map(
    sources.map((source) => [source.documentId, source.citation]),
  );

  return chunks
    .map((chunk, index) => {
      const citation = citationByDocumentId.get(chunk.documentId);

      return `[${citation}] Excerpt ${index + 1}
Title: ${chunk.document.title}
URL: ${chunk.document.url ?? "N/A"}
Published: ${chunk.document.publishedAt?.toISOString() ?? "Unknown"}

${chunk.text}`;
    })
    .join("\n\n---\n\n");
};

// 5. prompt builder
// turn query + chunks into model input
const buildPrompt = (question: string, context: string): string => {
  return `
Use the following source context to answer the question.

Context:
${context}

Question:
${question}

Write a short, grounded answer that:
-  uses only the context above
-  includes source citations like [1], [2]
-  notes uncertainty if the evidence is limited or disputed

Answer:
`.trim();
};

// 6. build context
const buildRagContext = async (
  input: RagQueryInput,
  chunksPerDocument = 2,
): Promise<RagQueryContext> => {
  const { query, limit } = input;
  const retrievalLimit = limit * OVERFETCH_FACTOR;
  const startedAt = performance.now();

  const retrievedChunks = await getRankedChunks(query, retrievalLimit);
  const retrievalLatencyMs = Math.round(performance.now() - startedAt);

  // @TODO: v2, round robin to minimise rank greed
  const cappedChunks = capChunksPerDocument(retrievedChunks, chunksPerDocument);
  const selectedChunks = cappedChunks.slice(0, limit);

  const sources = buildSources(selectedChunks);
  const context = buildContext(selectedChunks, sources);
  const prompt = buildPrompt(query, context);

  return {
    query,
    retrievalLimit,
    chunksPerDocument,
    retrievedChunks,
    selectedChunks,
    sources,
    context,
    prompt,
    retrievalLatencyMs,
  };
};

// 7. main orchestrator
export const runRagQuery = async (
  input: RagQueryInput,
  chunksPerDocument = 2,
): Promise<RagResult> => {
  const startedAt = performance.now();
  const context = await buildRagContext(input, chunksPerDocument);

  if (!context.selectedChunks.length) {
    void logRagNoResults({ query: context.query, latencyMs: context.retrievalLatencyMs });
    return {
      answer: NO_ANSWER_TEXT,
      retrievalLimit: context.retrievalLimit,
      chunksPerDocument,
      chunks: [],
      sources: [],
      latency: {
        retrievalMs: context.retrievalLatencyMs,
        generationMs: 0,
        totalMs: context.retrievalLatencyMs,
      },
    };
  }

  const generationStartedAt = performance.now();

  let result: GenerateTextResult;
  try {
    result = await generateText({
      model: openrouter.chat(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: context.prompt,
    });
  } catch (error) {
    const failureLatencyMs = Math.round(performance.now() - startedAt);

    void logRagFailure({
      query: context.query,
      latencyMs: failureLatencyMs,
      retrievedChunks: context.retrievedChunks,
      selectedChunks: context.selectedChunks,
      sources: context.sources,
      error,
    });
    throw error;
  }

  const generationLatencyMs = Math.round(performance.now() - generationStartedAt);
  const totalLatencyMs = Math.round(performance.now() - startedAt);

  void logRagSuccess({
    query: context.query,
    latencyMs: totalLatencyMs,
    retrievedChunks: context.retrievedChunks,
    selectedChunks: context.selectedChunks,
    sources: context.sources,
    result,
  });

  return {
    answer: result.text,
    retrievalLimit: context.retrievalLimit,
    chunksPerDocument,
    chunks: context.selectedChunks,
    sources: context.sources,
    latency: {
      retrievalMs: context.retrievalLatencyMs,
      generationMs: generationLatencyMs,
      totalMs: totalLatencyMs,
    },
    usage: toRagUsage(result.usage),
    finishReason: result.finishReason,
  };
};
