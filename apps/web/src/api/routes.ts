import type { DocumentDetailResponse, DocumentsListResponse } from "@osint-rag/types";
import { apiClient } from "@/api/client";

type DocumentsListParams = {
  page: number;
  limit: number;
};

export const api = {
  health: {
    ping: () => apiClient.get("").json<{ message: string }>(),
    check: () => apiClient.get("/health").json<{ uptime: number }>(),
  },
  documents: {
    list: ({ page, limit }: DocumentsListParams) =>
      apiClient
        .get("/documents", {
          searchParams: { page, limit },
        })
        .json<DocumentsListResponse>(),
    getById: (id: string) => apiClient.get(`/documents/${id}`).json<DocumentDetailResponse>(),
  },
};
