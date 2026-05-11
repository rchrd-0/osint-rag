import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/routes";

export const useGetAllDocuments = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: api.documents.getAll,
  });
};
