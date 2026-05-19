import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/api/routes";

export const DOCUMENTS_PAGE_SIZE = 25;

export const useInfiniteDocuments = () => {
  return useInfiniteQuery({
    queryKey: ["documents", "list", DOCUMENTS_PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      api.documents.list({
        page: pageParam,
        limit: DOCUMENTS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
};
