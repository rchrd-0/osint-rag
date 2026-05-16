import { ragQuerySchema } from "@osint-rag/schemas";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import { runRagQuery, toPublicRagQueryResponse } from "@/modules/rag/rag.service";

const ragRoutes = new Hono();

ragRoutes.post("/query", validator("json", ragQuerySchema), async (c) => {
  const result = await runRagQuery(c.req.valid("json"));

  return c.json({
    success: true,
    data: toPublicRagQueryResponse(result),
  });
});

ragRoutes.post("/query/debug", validator("json", ragQuerySchema), async (c) => {
  const result = await runRagQuery(c.req.valid("json"));

  return c.json({
    success: true,
    data: result,
  });
});

export default ragRoutes;
