import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { PaginatedResponse, Category, Subcategory } from "@/types/api";

// ── Category Queries ───────────────────────────────────────────────────────────

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

// ── Category Mutations ─────────────────────────────────────────────────────────

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

// ── Subcategory Queries ────────────────────────────────────────────────────────

export const useGetSubcategories = (categoryId: number) => {
  return useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Subcategory>>(
        `api/categories/${categoryId}/subcategories/`
      );
      return data;
    },
    enabled: !!categoryId,
  });
};

// ── Subcategory Mutations ──────────────────────────────────────────────────────

export const useCreateSubcategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; categoryId: number }) => {
      const { data } = await axiosAPI.post<Subcategory>(
        `api/categories/${payload.categoryId}/subcategories/`,
        { name: payload.name }
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["subcategories", variables.categoryId] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["publicCategories"] });
    },
  });
};

export const useUpdateSubcategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      categoryId,
      id,
      payload,
    }: {
      categoryId: number;
      id: number;
      payload: { name?: string };
    }) => {
      const { data } = await axiosAPI.patch<Subcategory>(
        `api/categories/${categoryId}/subcategories/${id}/`,
        payload
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["subcategories", variables.categoryId] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["publicCategories"] });
    },
  });
};

export const useDeleteSubcategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, id }: { categoryId: number; id: number }) => {
      await axiosAPI.delete(`api/categories/${categoryId}/subcategories/${id}/`);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["subcategories", variables.categoryId] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["publicCategories"] });
    },
  });
};
