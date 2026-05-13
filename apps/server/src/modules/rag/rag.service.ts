import { generateText } from "ai";
import { openrouter } from "@/lib/ai/openrouter";
import { type ChunkSearchResult, searchChunksFullText } from "@/modules/search/search.repository";

type RagSource = {
  citation: number;
  documentId: string;
  title: string;
  url: string | null;
  publishedAt: Date | null;
  chunkIds: string[];
};

const OVERFETCH_FACTOR = 3;
const SYSTEM_PROMPT = `You are an OSINT research assistant.

Answer the user's question using only the provided context.
If the context does not contain enough information, say:
"I don't have enough information from the provided sources."

Rules:
-  Do not invent facts, names, dates, or causal relationships.
-  Cite supporting sources using [1], [2], etc.
-  Be concise, factual, and neutral.
-  If sources disagree, say so briefly.`;

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
    .map((chunk) => {
      const citation = citationByDocumentId.get(chunk.documentId);

      return `[${citation}]
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
Context:
${context}

Question:
${question}

Answer:
`.trim();
};

// 6. main orchestrator
export const runRagQuery = async (query: string, limit: number, chunksPerDocument = 2) => {
  const retrievalLimit = limit * OVERFETCH_FACTOR;
  const retrievedChunks = await getRankedChunks(query, retrievalLimit);
  if (!retrievedChunks.length) {
    return {
      answer: "No relevant information found in the document collection.",
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
      },
    };
  }

  // @TODO: v2, round robin to minimise rank greed
  const cappedChunks = capChunksPerDocument(retrievedChunks, chunksPerDocument);
  const selectedChunks = cappedChunks.slice(0, limit);

  const sources = buildSources(selectedChunks);
  const context = buildContext(selectedChunks, sources);
  const prompt = buildPrompt(query, context);

  const result = await generateText({
    model: openrouter.chat("google/gemini-2.5-flash-lite"),
    system: SYSTEM_PROMPT,
    prompt,
  });

  console.dir(
    {
      preview: result.text.slice(0, 300),
      finishReason: result.finishReason,
      sourceCount: sources.length,
      usage: {
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
        totalTokens: result.usage?.totalTokens,
        cost: result.usage?.raw?.cost,
      },
    },
    { depth: null },
  );

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
    },
    // remove
    context,
  };
};
