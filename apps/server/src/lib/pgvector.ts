import { assertEmbeddingLength } from "@/lib/ai/embeddings";

export const toPgVectorLiteral = (vector: number[]): string => {
  assertEmbeddingLength(vector);

  return `[${vector.join(",")}]`;
};
