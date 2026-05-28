import { QueryStrategyEnum, SearchModeEnum, searchQuerySchema } from "@osint-rag/schemas";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import {
  type ChunkSearchResult,
  searchChunksContains,
  searchChunksFullText,
  searchChunksVector,
} from "@/modules/search/search.repository";
import { selectChunksRoundRobin } from "./search.diversity";

const searchRoutes = new Hono();

searchRoutes.get("/", validator("query", searchQuerySchema), async (c) => {
  const { q: query, limit, strategy, mode, chunksPerDocument } = c.req.valid("query");
  const isDiversified = mode === SearchModeEnum.enum.diversified;
  const retrievalLimit = isDiversified ? Math.min(limit * 3, 30) : limit;

  let retrievedChunks: ChunkSearchResult[];
  switch (strategy) {
    case QueryStrategyEnum.enum.naive:
      retrievedChunks = await searchChunksContains(query, retrievalLimit);
      break;
    case QueryStrategyEnum.enum.fts:
      retrievedChunks = await searchChunksFullText(query, retrievalLimit);
      break;
    case QueryStrategyEnum.enum.vector:
      retrievedChunks = await searchChunksVector(query, retrievalLimit);
      break;
  }

  const chunks = isDiversified
    ? selectChunksRoundRobin(retrievedChunks, limit, chunksPerDocument)
    : retrievedChunks;

  return c.json({
    success: true,
    data: {
      results: chunks,
      meta: {
        query: query,
        strategy: strategy,
        mode: mode,
        limit: limit,
        retrievalLimit: retrievalLimit,
        chunksPerDocument: isDiversified ? chunksPerDocument : null,
        retrieved: retrievedChunks.length,
        returned: chunks.length,
      },
    },
  });
});

export default searchRoutes;
