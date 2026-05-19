import type { DocumentsListQuery } from "@osint-rag/schemas";
import type { DocumentItem, DocumentsListResponse } from "@osint-rag/types";
import { HTTPException } from "hono/http-exception";
import {
  countDocuments,
  type DocumentListRow,
  findDocumentById,
  findDocumentsPage,
} from "@/modules/documents/documents.repository";

const mapDocumentItem = (document: DocumentListRow): DocumentItem => {
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

export const getDocumentsPage = async (
  query: DocumentsListQuery,
): Promise<DocumentsListResponse> => {
  const rows = await findDocumentsPage({ page: query.page, limit: query.limit });
  const hasMore = rows.length > query.limit;
  const items = hasMore ? rows.slice(0, query.limit) : rows;
  const totalCount = await countDocuments();

  return {
    items: items.map(mapDocumentItem),
    page: query.page,
    hasMore,
    totalCount,
  };
};

export const getDocument = async (id: string) => {
  const document = await findDocumentById(id);

  if (!document) {
    throw new HTTPException(404, { message: "Document not found" });
  }

  return mapDocumentDetail(document);
};
