import { Hono } from "hono";
import { getDocument, getDocuments } from "@/modules/documents/documents.service";

const documentsRoutes = new Hono();

documentsRoutes.get("/", async (c) => {
  const documents = await getDocuments();

  return c.json({
    success: true,
    data: documents,
  });
});

documentsRoutes.get("/:id", async (c) => {
  const { id } = c.req.param();

  const document = await getDocument(id);

  return c.json({
    success: true,
    data: document,
  });
});

export default documentsRoutes;
