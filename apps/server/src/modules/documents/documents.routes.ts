import { documentsListQuerySchema } from "@osint-rag/schemas";
import { Hono } from "hono";
import { validator } from "@/lib/validator";
import { getDocument, getDocumentsPage } from "@/modules/documents/documents.service";

const documentsRoutes = new Hono();

documentsRoutes.get("/", validator("query", documentsListQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const docs = await getDocumentsPage(query);

  return c.json({
    success: true,
    data: docs,
  });
});

documentsRoutes.get("/:id", async (c) => {
  const { id } = c.req.param();

  const doc = await getDocument(id);

  return c.json({
    success: true,
    data: doc,
  });
});

export default documentsRoutes;
