import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { PaginatedResponse, Catalog } from "@/types/api";

export const useGetCatalogs = () => {
  return useQuery({
    queryKey: ["catalogs"],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Catalog>>(
        "api/catalogs/"
      );
      return data;
    },
  });
};

export const useCreateCatalog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axiosAPI.post<Catalog>("api/catalogs/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogs"] });
    },
  });
};

export const useUpdateCatalog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: FormData }) => {
      const { data } = await axiosAPI.patch<Catalog>(
        `api/catalogs/${id}/`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogs"] });
    },
  });
};

export const useDeleteCatalog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosAPI.delete(`api/catalogs/${id}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogs"] });
    },
  });
};
