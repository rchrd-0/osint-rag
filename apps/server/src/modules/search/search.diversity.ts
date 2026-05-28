import type { ChunkSearchResult } from "./search.repository";

export const selectChunksRoundRobin = (
  chunks: ChunkSearchResult[],
  limit: number,
  chunksPerDocument = 2,
): ChunkSearchResult[] => {
  const chunksByDocumentId = new Map<string, ChunkSearchResult[]>();

  // preserve retriever order within each document while capping duplicates
  for (const chunk of chunks) {
    const existingChunks = chunksByDocumentId.get(chunk.documentId);

    if (!existingChunks) {
      chunksByDocumentId.set(chunk.documentId, [chunk]);
      continue;
    }

    if (existingChunks.length >= chunksPerDocument) {
      continue;
    }

    existingChunks.push(chunk);
  }

  const chunkQueues = Array.from(chunksByDocumentId.values());
  const results: ChunkSearchResult[] = [];

  // take one chunk per document each pass to reduce rank-greedy clustering
  while (results.length < limit) {
    let addedChunkThisRound = false;

    for (const queue of chunkQueues) {
      const nextChunk = queue.shift();

      if (!nextChunk) {
        continue;
      }

      results.push(nextChunk);
      addedChunkThisRound = true;

      if (results.length >= limit) {
        return results;
      }
    }

    if (!addedChunkThisRound) {
      break;
    }
  }

  return results;
};
