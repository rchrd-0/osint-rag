type DocumentBase = {
  id: string;
  title: string;
  sourceType: string;
  sourceName: string | null;
  author: string | null;
  url: string | null;
  publishedAt: string | null;
};

export type DocumentDetailResponse = DocumentBase & {
  rawText: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentItem = DocumentBase;

export type DocumentsListResponse = {
  items: DocumentItem[];
  page: number;
  hasMore: boolean;
  totalCount: number;
};
