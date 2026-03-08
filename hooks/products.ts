import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { PaginatedResponse, Product, Category } from "@/types/api";

// ── Public hooks ──────────────────────────────────────────────────────────────

export const useGetPublicProducts = (
  search: string,
  page: number,
  categorySlug: string,
  minPrice: string,
  maxPrice: string,
  isFeatured: string,
  ordering: string
) => {
  return useQuery({
    queryKey: [
      "publicProducts",
      search,
      page,
      categorySlug,
      minPrice,
      maxPrice,
      isFeatured,
      ordering,
    ],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Product>>(
        "api/products/",
        {
          params: {
            search,
            page,
            category_slug: categorySlug,
            min_price: minPrice,
            max_price: maxPrice,
            is_featured: isFeatured,
            ordering,
          },
        }
      );
      return data;
    },
  });
};

export const useGetProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await axiosAPI.get<Product>(`api/products/${slug}/`);
      return data;
    },
    enabled: !!slug,
  });
};

export const useGetFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Product>>(
        "api/products/featured/"
      );
      return data;
    },
  });
};

export const useGetPublicCategories = () => {
  return useQuery({
    queryKey: ["publicCategories"],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Category>>(
        "api/categories/"
      );
      return data;
    },
  });
};

// ── Admin hooks ───────────────────────────────────────────────────────────────

export const useGetAdminProducts = (
  search: string,
  page: number,
  categoryId: string,
  isActive: string,
  ordering: string
) => {
  return useQuery({
    queryKey: ["adminProducts", search, page, categoryId, isActive, ordering],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Product>>(
        "api/products/",
        {
          params: {
            search,
            page,
            category: categoryId,
            is_active: isActive,
            ordering,
          },
        }
      );
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData | Partial<Product>) => {
      const { data } = await axiosAPI.post<Product>("api/products/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: FormData | Partial<Product>;
    }) => {
      const { data } = await axiosAPI.patch<Product>(
        `api/products/${id}/`,
        payload
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      qc.invalidateQueries({ queryKey: ["product", String(id)] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosAPI.delete(`api/products/${id}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });
};

export const useToggleProductActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { data } = await axiosAPI.patch<Product>(`api/products/${id}/`, {
        is_active,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });
};

export const useToggleProductFeatured = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      is_featured,
    }: {
      id: number;
      is_featured: boolean;
    }) => {
      const { data } = await axiosAPI.patch<Product>(`api/products/${id}/`, {
        is_featured,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });
};

export const useUpdateProductStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stock }: { id: number; stock: number }) => {
      const { data } = await axiosAPI.patch<Product>(
        `api/products/${id}/update-stock/`,
        { stock }
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      qc.invalidateQueries({ queryKey: ["product", String(id)] });
    },
  });
};
