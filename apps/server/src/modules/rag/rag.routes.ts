import { ragQuerySchema } from "@osint-rag/schemas";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import { runRagQuery } from "@/modules/rag/rag.service";

const ragRoutes = new Hono();

ragRoutes.post("/query", validator("json", ragQuerySchema), async (c) => {
  const { query, limit } = c.req.valid("json");

  const answer = await runRagQuery(query, limit);

  return c.json({
    success: true,
    data: answer,
  });
});

export default ragRoutes;
