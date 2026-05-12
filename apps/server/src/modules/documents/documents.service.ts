import type { DocumentItem } from "@osint-rag/types";
import { HTTPException } from "hono/http-exception";
import { findDocumentById, findDocuments } from "@/modules/documents/documents.repository";

const mapDocumentItem = (
  document: Awaited<ReturnType<typeof findDocuments>>[number],
): DocumentItem => {
  return {
    id: document.id,
    title: document.title,
    sourceType: document.sourceType,
    sourceName: document.sourceName,
    author: document.author,
    url: document.url,
    publishedAt: document.publishedAt?.toISOString() ?? null,
  };
};

const mapDocumentDetail = (document: NonNullable<Awaited<ReturnType<typeof findDocumentById>>>) => {
  return {
    ...mapDocumentItem(document),
    rawText: document.rawText,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
};

export const getDocuments = async () => {
  const documents = await findDocuments();

  return documents.map(mapDocumentItem);
};

export const getDocument = async (id: string) => {
  const document = await findDocumentById(id);

  if (!document) {
    throw new HTTPException(404, { message: "Document not found" });
  }

  return mapDocumentDetail(document);
};
