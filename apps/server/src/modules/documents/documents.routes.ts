import { Hono } from "hono";
import { getDocument, getDocuments } from "@/modules/documents/documents.service";

const documentsRoutes = new Hono();

documentsRoutes.get("/", async (c) => {
  const docs = await getDocuments();

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
