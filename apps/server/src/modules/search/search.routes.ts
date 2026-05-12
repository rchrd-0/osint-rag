import { QueryStrategyEnum, searchQuerySchema } from "@osint-rag/schemas";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import { searchChunksContains, searchChunksFullText } from "@/modules/search/search.repository";

const searchRoutes = new Hono();

searchRoutes.get("/", validator("query", searchQuerySchema), async (c) => {
  const { q: query, limit, strategy } = c.req.valid("query");

  const chunks =
    strategy === QueryStrategyEnum.enum.naive
      ? await searchChunksContains(query, limit)
      : await searchChunksFullText(query, limit);

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
