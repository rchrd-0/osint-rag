import { generateText } from "ai";
import { openrouter } from "@/lib/ai/openrouter";
import { type ChunkSearchResult, searchChunksFullText } from "@/modules/search/search.repository";
import { MODEL_ID, NO_ANSWER_TEXT, type RagSource } from "./rag.constants";
import {
  type GenerateTextResult,
  logRagFailure,
  logRagNoResults,
  logRagSuccess,
} from "./rag.logging";

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
      publishedAt: chunk.document.publishedAt,
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

// 6. main orchestrator
export const runRagQuery = async (query: string, limit: number, chunksPerDocument = 2) => {
  const retrievalLimit = limit * OVERFETCH_FACTOR;
  const startedAt = performance.now();
  const retrievedChunks = await getRankedChunks(query, retrievalLimit);
  const retrievalLatencyMs = Math.round(performance.now() - startedAt);
  if (!retrievedChunks.length) {
    void logRagNoResults({ query, latencyMs: retrievalLatencyMs });

    return {
      answer: NO_ANSWER_TEXT,
      chunks: [],
      sources: [],
      meta: {
        query,
        strategy: "fts",
        requestedLimit: limit,
        retrievalLimit,
        used: 0,
        chunksPerDocument,
        noResults: true,
        latency: {
          retrievalMs: retrievalLatencyMs,
          generationMs: 0,
          totalMs: retrievalLatencyMs,
        },
      },
    };
  }

  // @TODO: v2, round robin to minimise rank greed
  const cappedChunks = capChunksPerDocument(retrievedChunks, chunksPerDocument);
  const selectedChunks = cappedChunks.slice(0, limit);

  const sources = buildSources(selectedChunks);
  const context = buildContext(selectedChunks, sources);
  const prompt = buildPrompt(query, context);

  const generationStartedAt = performance.now();

  let result: GenerateTextResult;
  try {
    result = await generateText({
      model: openrouter.chat(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt,
    });
  } catch (error) {
    const failureLatencyMs = Math.round(performance.now() - startedAt);

    void logRagFailure({
      query,
      latencyMs: failureLatencyMs,
      retrievedChunks,
      selectedChunks,
      sources,
      error,
    });
    throw error;
  }

  const generationLatencyMs = Math.round(performance.now() - generationStartedAt);
  const totalLatencyMs = Math.round(performance.now() - startedAt);

  // console.dir(
  //   {
  //     preview: result.text.slice(0, 300),
  //     finishReason: result.finishReason,
  //     sourceCount: sources.length,
  //     usage: {
  //       inputTokens: result.usage?.inputTokens,
  //       outputTokens: result.usage?.outputTokens,
  //       totalTokens: result.usage?.totalTokens,
  //       cost: result.usage?.raw?.cost,
  //     },
  //     latency: {
  //       retrievalMs: retrievalLatencyMs,
  //       generationMs: generationLatencyMs,
  //       totalMs: totalLatencyMs,
  //     },
  //   },
  //   { depth: null },
  // );

  void logRagSuccess({
    query,
    latencyMs: totalLatencyMs,
    retrievedChunks,
    selectedChunks,
    sources,
    result,
  });

  return {
    answer: result.text,
    chunks: selectedChunks,
    sources,
    meta: {
      query,
      strategy: "fts",
      requestedLimit: limit,
      retrievalLimit,
      used: selectedChunks.length,
      chunksPerDocument,
      usage: result.usage,
      finishReason: result.finishReason,
      noResults: false,
      latency: {
        retrievalMs: retrievalLatencyMs,
        generationMs: generationLatencyMs,
        totalMs: totalLatencyMs,
      },
    },
    // remove
    // context,
  };
};
