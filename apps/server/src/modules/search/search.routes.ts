import { QueryStrategyEnum, searchQuerySchema } from "@osint-rag/schemas";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import {
  type ChunkSearchResult,
  searchChunksContains,
  searchChunksFullText,
  searchChunksVector,
} from "@/modules/search/search.repository";

const searchRoutes = new Hono();

searchRoutes.get("/", validator("query", searchQuerySchema), async (c) => {
  const { q: query, limit, strategy } = c.req.valid("query");

  let chunks: ChunkSearchResult[];
  switch (strategy) {
    case QueryStrategyEnum.enum.naive:
      chunks = await searchChunksContains(query, limit);
      break;
    case QueryStrategyEnum.enum.fts:
      chunks = await searchChunksFullText(query, limit);
      break;
    case QueryStrategyEnum.enum.vector:
      chunks = await searchChunksVector(query, limit);
      break;
  }

  return c.json({
    success: true,
    data: {
      results: chunks,
      meta: {
        query: query,
        strategy: strategy,
        limit: limit,
        returned: chunks.length,
      },
    },
  });
});

export default searchRoutes;
