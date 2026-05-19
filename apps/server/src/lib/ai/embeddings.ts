import { embedMany } from "ai";
import { openrouter } from "./openrouter";

export const EMBEDDING_MODEL_ID = "openai/text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export const assertEmbeddingLength = (vector: number[]): void => {
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${vector.length}`);
  }
};

export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  if (!texts.length) {
    return [];
  }

  const normalizedTexts = texts.map((text, i) => {
    const trimmed = text.trim();

    if (!trimmed) {
      throw new Error(`Text is empty at index ${i}`);
    }

    return trimmed;
  });

  const { embeddings } = await embedMany({
    model: openrouter.textEmbeddingModel(EMBEDDING_MODEL_ID, {
      extraBody: {
        dimensions: EMBEDDING_DIMENSIONS,
      },
    }),
    values: normalizedTexts,
  });

  if (embeddings.length !== normalizedTexts.length) {
    throw new Error(`Expected ${normalizedTexts.length} embeddings, got ${embeddings.length}`);
  }

  for (const [i, vector] of embeddings.entries()) {
    if (!Array.isArray(vector)) {
      throw new Error(`Embedding missing at index ${i}`);
    }
    assertEmbeddingLength(vector);
  }

  return embeddings;
};

export const embedText = async (text: string): Promise<number[]> => {
  const [vector] = await embedTexts([text]);

  if (!Array.isArray(vector)) {
    throw new Error("Embedding failed");
  }

  return vector;
};
