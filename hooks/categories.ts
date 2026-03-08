import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { PaginatedResponse, Category } from "@/types/api";

// ── Queries ───────────────────────────────────────────────────────────────────

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Category>>(
        "api/categories/"
      );
      return data;
    },
  });
};

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Pick<Category, "name" | "is_active"> & { description?: string }
    ) => {
      const { data } = await axiosAPI.post<Category>(
        "api/categories/",
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["publicCategories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Pick<Category, "name" | "description" | "is_active">>;
    }) => {
      const { data } = await axiosAPI.patch<Category>(
        `api/categories/${id}/`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["publicCategories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosAPI.delete(`api/categories/${id}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["publicCategories"] });
    },
  });
};
