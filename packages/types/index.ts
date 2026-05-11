export type ApiSuccessResponse<T = undefined> = {
  success: true;
  data?: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
};

export type ApiResponse<T = undefined> = ApiSuccessResponse<T> | ApiErrorResponse;

export type DocumentBase = {
  id: string;
  title: string;
  sourceType: string;
  sourceName: string | null;
  author: string | null;
  url: string | null;
  publishedAt: string | null;
};

export type DocumentItem = DocumentBase;
