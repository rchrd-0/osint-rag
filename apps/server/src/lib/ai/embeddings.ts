import { embedMany } from "ai";
import { openrouter } from "./openrouter";

export const EMBEDDING_MODEL_ID = "openai/text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export type EmbedTextsResult = {
  embeddings: number[][];
  tokens: number;
  cost: number | null;
};

const extractOpenRouterEmbedCost = (providerMetadata: unknown): number | null => {
  if (providerMetadata === null || typeof providerMetadata !== "object") {
    return null;
  }

  const openrouterMetadata = (providerMetadata as Record<string, unknown>).openrouter;
  if (openrouterMetadata === null || typeof openrouterMetadata !== "object") {
    return null;
  }

  const usage = (openrouterMetadata as Record<string, unknown>).usage;
  if (usage === null || typeof usage !== "object") {
    return null;
  }

  const cost = (usage as Record<string, unknown>).cost;
  return typeof cost === "number" && Number.isFinite(cost) ? cost : null;
};

export const assertEmbeddingLength = (vector: number[]): void => {
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${vector.length}`);
  }
};

export const embedTexts = async (texts: string[]): Promise<EmbedTextsResult> => {
  if (!texts.length) {
    return { embeddings: [], tokens: 0, cost: null };
  }

  const normalizedTexts = texts.map((text, i) => {
    const trimmed = text.trim();

    if (!trimmed) {
      throw new Error(`Text is empty at index ${i}`);
    }

    return trimmed;
  });

  const result = await embedMany({
    model: openrouter.textEmbeddingModel(EMBEDDING_MODEL_ID, {
      extraBody: {
        dimensions: EMBEDDING_DIMENSIONS,
      },
    }),
    values: normalizedTexts,
  });

  const { embeddings } = result;

  if (embeddings.length !== normalizedTexts.length) {
    throw new Error(`Expected ${normalizedTexts.length} embeddings, got ${embeddings.length}`);
  }

  for (const [i, vector] of embeddings.entries()) {
    if (!Array.isArray(vector)) {
      throw new Error(`Embedding missing at index ${i}`);
    }
    assertEmbeddingLength(vector);
  }

  return {
    embeddings,
    tokens: result.usage.tokens,
    cost: extractOpenRouterEmbedCost(result.providerMetadata),
  };
};

export const embedText = async (text: string): Promise<number[]> => {
  const { embeddings } = await embedTexts([text]);
  const vector = embeddings[0];

  if (!vector) {
    throw new Error("Embedding failed");
  }

  return vector;
};
