import type { DocumentBase, DocumentItem } from "@osint-rag/types";
import { apiClient } from "@/api/client";

type DocumentDetailResponse = DocumentBase & {
  rawText: string;
  createdAt: string;
  updatedAt: string;
};

export const api = {
  health: {
    ping: () => apiClient.get("").json<{ message: string }>(),
    check: () => apiClient.get("/health").json<{ uptime: number }>(),
  },
  documents: {
    getAll: () => apiClient.get("/documents").json<DocumentItem[]>(),
    getById: (id: string) => apiClient.get(`/documents/${id}`).json<DocumentDetailResponse>(),
  },
};
