import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/routes";

export const useGetDocumentById = (id: string) => {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => api.documents.getById(id),
  });
};
