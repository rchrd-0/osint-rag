import { QueryStrategyEnum, type RagQueryInput } from "@osint-rag/schemas";
import type {
  RagChunk,
  RagFullQueryResponse,
  RagLatency,
  RagQueryResponse,
  RagSource,
  RagStreamData,
  RagUsage,
} from "@osint-rag/types";
import { createUIMessageStream, generateId, generateText, streamText, type UIMessage } from "ai";
import { openrouter } from "@/lib/ai/openrouter";
import { selectChunksRoundRobin } from "@/modules/search/search.diversity";
import {
  type ChunkSearchResult,
  searchChunksContains,
  searchChunksFullText,
  searchChunksVector,
} from "@/modules/search/search.repository";
import { dateToIsoString } from "@/utils/format";
import { RAG_MODEL_ID, RAG_NO_ANSWER_TEXT } from "./rag.constants";
import {
  logRagFailure,
  logRagNoResults,
  logRagSuccess,
  type RagGenerationResult,
} from "./rag.logging";
import type { RagQueryContext } from "./rag.types";

type RagStreamMessage = UIMessage<never, RagStreamData>;

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

// helpers
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

const toRagChunks = (chunks: ChunkSearchResult[]): RagChunk[] =>
  chunks.map((chunk) => ({
    id: chunk.id,
    documentId: chunk.documentId,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    document: {
      url: chunk.document.url,
      title: chunk.document.title,
      publishedAt: dateToIsoString(chunk.document.publishedAt),
    },
    rank: chunk.rank ?? null,
  }));

const buildFullRagQueryResponse = (params: {
  input: RagQueryInput;
  answer: string;
  chunks: ChunkSearchResult[];
  sources: RagSource[];
  retrievalLimit: number;
  chunksPerDocument: number;
  latency: RagLatency;
  usage?: RagUsage;
  finishReason?: string;
}): RagFullQueryResponse => ({
  answer: params.answer,
  chunks: toRagChunks(params.chunks),
  sources: params.sources,
  meta: {
    query: params.input.query,
    strategy: params.input.strategy,
    requestedLimit: params.input.limit,
    retrievalLimit: params.retrievalLimit,
    used: params.chunks.length,
    chunksPerDocument: params.chunksPerDocument,
    noResults: params.chunks.length === 0,
    sourceCount: params.sources.length,
    latency: params.latency,
    usage: params.usage,
    finishReason: params.finishReason,
  },
});

export const toPublicRagQueryResponse = (response: RagFullQueryResponse): RagQueryResponse => {
  const { chunks: _chunks, meta, ...rest } = response;

  return {
    ...rest,
    meta: {
      strategy: meta.strategy,
      noResults: meta.noResults,
      sourceCount: meta.sourceCount,
      latency: meta.latency,
    },
  };
};

// 1. retrieval helper
const getRankedChunks = async ({
  query,
  limit,
  strategy,
}: RagQueryInput): Promise<ChunkSearchResult[]> => {
  switch (strategy) {
    case QueryStrategyEnum.enum.naive:
      return await searchChunksContains(query, limit);
    case QueryStrategyEnum.enum.fts:
      return await searchChunksFullText(query, limit);
    case QueryStrategyEnum.enum.vector:
      return await searchChunksVector(query, limit);
  }
};

// 3. source builder
const buildSources = (chunks: ChunkSearchResult[]): RagSource[] => {
  const sourceByDocumentId = new Map<string, RagSource>();

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
      publishedAt: dateToIsoString(chunk.document.publishedAt),
      chunkIds: [chunk.id],
    });
  }

  return Array.from(sourceByDocumentId.values());
};

// 4. build context
const buildContext = (chunks: ChunkSearchResult[], sources: RagSource[]): string => {
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
  const { query, limit, strategy } = input;
  const retrievalLimit = limit * OVERFETCH_FACTOR;
  const startedAt = performance.now();

  const retrievedChunks = await getRankedChunks({ query, limit: retrievalLimit, strategy });
  const retrievalLatencyMs = Math.round(performance.now() - startedAt);

  const selectedChunks = selectChunksRoundRobin(retrievedChunks, limit, chunksPerDocument);

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

// 7a. generateText, non stream
export const runRagQuery = async (
  input: RagQueryInput,
  chunksPerDocument = 2,
): Promise<RagFullQueryResponse> => {
  const startedAt = performance.now();
  const context = await buildRagContext(input, chunksPerDocument);

  if (!context.selectedChunks.length) {
    void logRagNoResults({
      query: context.query,
      latencyMs: context.retrievalLatencyMs,
      strategy: input.strategy,
    });

    return buildFullRagQueryResponse({
      input,
      answer: RAG_NO_ANSWER_TEXT,
      chunks: [],
      sources: [],
      retrievalLimit: context.retrievalLimit,
      chunksPerDocument,
      latency: {
        retrievalMs: context.retrievalLatencyMs,
        generationMs: 0,
        totalMs: context.retrievalLatencyMs,
      },
    });
  }

  const generationStartedAt = performance.now();

  let result: RagGenerationResult;
  try {
    result = await generateText({
      model: openrouter.chat(RAG_MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: context.prompt,
    });
  } catch (error) {
    const failureLatencyMs = Math.round(performance.now() - startedAt);

    void logRagFailure({
      query: context.query,
      strategy: input.strategy,
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
    strategy: input.strategy,
    latencyMs: totalLatencyMs,
    retrievedChunks: context.retrievedChunks,
    selectedChunks: context.selectedChunks,
    sources: context.sources,
    result,
  });

  return buildFullRagQueryResponse({
    input,
    answer: result.text,
    chunks: context.selectedChunks,
    sources: context.sources,
    retrievalLimit: context.retrievalLimit,
    chunksPerDocument,
    latency: {
      retrievalMs: context.retrievalLatencyMs,
      generationMs: generationLatencyMs,
      totalMs: totalLatencyMs,
    },
    usage: toRagUsage(result.usage),
    finishReason: result.finishReason,
  });
};

// 7b. stream
export const streamRagQuery = async (input: RagQueryInput, chunksPerDocument = 2) => {
  const startedAt = performance.now();

  const stream = createUIMessageStream<RagStreamMessage>({
    execute: async ({ writer }) => {
      const context = await buildRagContext(input, chunksPerDocument);

      writer.write({
        type: "data-sources",
        data: {
          sources: context.sources,
          retrievalMs: context.retrievalLatencyMs,
        },
      });

      if (!context.selectedChunks.length) {
        void logRagNoResults({
          query: context.query,
          latencyMs: context.retrievalLatencyMs,
          strategy: input.strategy,
        });

        const textId = generateId();

        writer.write({ type: "start" });
        writer.write({ type: "start-step" });
        writer.write({ type: "text-start", id: textId });
        writer.write({ type: "text-delta", id: textId, delta: RAG_NO_ANSWER_TEXT });
        writer.write({ type: "text-end", id: textId });
        writer.write({ type: "finish-step" });
        writer.write({
          type: "data-meta",
          data: {
            strategy: input.strategy,
            requestedLimit: input.limit,
            used: 0,
            chunksPerDocument,
            noResults: true,
            query: input.query,
            retrievalLimit: context.retrievalLimit,
            sourceCount: 0,
            latency: {
              retrievalMs: context.retrievalLatencyMs,
              generationMs: 0,
              totalMs: context.retrievalLatencyMs,
            },
          },
        });
        writer.write({
          type: "finish",
          finishReason: "stop",
        });

        return;
      }

      const generationStartedAt = performance.now();

      const result = streamText({
        model: openrouter.chat(RAG_MODEL_ID),
        system: SYSTEM_PROMPT,
        prompt: context.prompt,
        onFinish: ({ text, usage, finishReason }) => {
          const generationLatencyMs = Math.round(performance.now() - generationStartedAt);
          const totalLatencyMs = Math.round(performance.now() - startedAt);

          const generationResult: RagGenerationResult = {
            text,
            usage,
            finishReason,
          };

          writer.write({
            type: "data-meta",
            data: {
              strategy: input.strategy,
              requestedLimit: input.limit,
              used: context.selectedChunks.length,
              chunksPerDocument: chunksPerDocument,
              noResults: false,
              query: input.query,
              retrievalLimit: context.retrievalLimit,
              sourceCount: context.sources.length,
              latency: {
                generationMs: generationLatencyMs,
                retrievalMs: context.retrievalLatencyMs,
                totalMs: totalLatencyMs,
              },
              usage: toRagUsage(generationResult.usage),
              finishReason: generationResult.finishReason,
            },
          });

          void logRagSuccess({
            query: context.query,
            strategy: input.strategy,
            latencyMs: totalLatencyMs,
            retrievedChunks: context.retrievedChunks,
            selectedChunks: context.selectedChunks,
            sources: context.sources,
            result: generationResult,
          });
        },
        onError: ({ error }) => {
          const failureLatencyMs = Math.round(performance.now() - startedAt);

          void logRagFailure({
            query: context.query,
            strategy: input.strategy,
            latencyMs: failureLatencyMs,
            retrievedChunks: context.retrievedChunks,
            selectedChunks: context.selectedChunks,
            sources: context.sources,
            error,
          });
        },
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return stream;
};
