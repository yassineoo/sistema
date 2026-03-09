import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { PaginatedResponse, Product, Category } from "@/types/api";

// ── Public hooks ──────────────────────────────────────────────────────────────

export const useGetPublicProducts = (
  search: string,
  page: number,
  categoryId: string,
  minPrice: string,
  maxPrice: string,
  isFeatured: string,
  ordering: string,
  subcategoryId?: string
) => {
  return useQuery({
    queryKey: [
      "publicProducts",
      search,
      page,
      categoryId,
      minPrice,
      maxPrice,
      isFeatured,
      ordering,
      subcategoryId,
    ],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Product>>(
        "api/products/",
        {
          params: {
            search: search || undefined,
            page,
            category_id: categoryId || undefined,
            subcategory_id: subcategoryId || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            is_featured: isFeatured || undefined,
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
            search: search || undefined,
            page,
            category_id: categoryId || undefined,
            is_active: isActive || undefined,
            ordering,
          },
        }
      );
      return data;
    },
  });
};

export const useGetAdminProductById = (id: number) => {
  return useQuery({
    queryKey: ["adminProduct", id],
    queryFn: async () => {
      const { data } = await axiosAPI.get<Product>(`api/products/${id}/`);
      return data;
    },
    enabled: id > 0,
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axiosAPI.post<Product>("api/products/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      qc.invalidateQueries({ queryKey: ["publicProducts"] });
      qc.invalidateQueries({ queryKey: ["featuredProducts"] });
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
      payload: FormData;
    }) => {
      const { data } = await axiosAPI.patch<Product>(
        `api/products/${id}/`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      qc.invalidateQueries({ queryKey: ["adminProduct", id] });
      qc.invalidateQueries({ queryKey: ["publicProducts"] });
      qc.invalidateQueries({ queryKey: ["featuredProducts"] });
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
      qc.invalidateQueries({ queryKey: ["publicProducts"] });
    },
  });
};

export const useToggleProductActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const fd = new FormData();
      fd.append("is_active", String(is_active));
      const { data } = await axiosAPI.patch<Product>(`api/products/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
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
      const fd = new FormData();
      fd.append("is_featured", String(is_featured));
      const { data } = await axiosAPI.patch<Product>(`api/products/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
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
      qc.invalidateQueries({ queryKey: ["adminProduct", id] });
    },
  });
};
