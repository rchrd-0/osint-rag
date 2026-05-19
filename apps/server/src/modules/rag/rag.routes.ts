import { env } from "@osint-rag/env/server";
import { ragQuerySchema } from "@osint-rag/schemas";
import { createUIMessageStreamResponse } from "ai";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import { runRagQuery, streamRagQuery, toPublicRagQueryResponse } from "@/modules/rag/rag.service";

const ragRoutes = new Hono();

ragRoutes.post("/query", validator("json", ragQuerySchema), async (c) => {
  const result = await runRagQuery(c.req.valid("json"));

  return c.json({
    success: true,
    data: toPublicRagQueryResponse(result),
  });
});

if (env.NODE_ENV !== "production") {
  ragRoutes.post("/query/debug", validator("json", ragQuerySchema), async (c) => {
    const result = await runRagQuery(c.req.valid("json"));

    return c.json({
      success: true,
      data: result,
    });
  });
}

ragRoutes.post("/stream", validator("json", ragQuerySchema), async (c) => {
  const stream = await streamRagQuery(c.req.valid("json"));

  return createUIMessageStreamResponse({ stream });
});

export default ragRoutes;
