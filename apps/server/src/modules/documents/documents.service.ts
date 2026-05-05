import { HTTPException } from "hono/http-exception";
import { findDocumentById, findDocuments } from "@/modules/documents/documents.repository";

export const getDocuments = async () => {
  const documents = await findDocuments();

  return documents;
};

export const getDocument = async (id: string) => {
  const document = await findDocumentById(id);

  if (!document) {
    throw new HTTPException(404, { message: "Document not found" });
  }

  return document;
};
