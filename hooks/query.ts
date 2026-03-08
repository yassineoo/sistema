import { axiosAPI } from "@/lib/constant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Auth is cookie-based (httpOnly access_token + refresh_token).
 * No Authorization header — withCredentials is set globally in axiosAPI.
 */

// ── GET list ────────────────────────────────────────────────────────────────
export const useGetItems = (
  path: string,
  page?: number,
  page_size?: number,
  filters?: Record<string, unknown>
) => {
  return useQuery({
    queryKey: ["getItems", path, page, filters],
    queryFn: async () => {
      const res = await axiosAPI.get(`/${path}/`, {
        params: { page, page_size, ...filters },
      });
      return res.data;
    },
  });
};

// ── GET single ──────────────────────────────────────────────────────────────
export const useGetItem = (path: string, id: string | number) => {
  return useQuery({
    queryKey: ["getItems", path, id],
    queryFn: async () => {
      const res = await axiosAPI.get(`/${path}/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
};

// ── CREATE ──────────────────────────────────────────────────────────────────
export const useCreateItem = (
  path: string,
  media_type = false,
  keys?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await axiosAPI.post(`/${path}/`, data, {
        headers: media_type ? { "Content-Type": "multipart/form-data" } : {},
      });
      return res.data;
    },
    onSuccess: () => {
      const invalidate = keys ?? [path];
      invalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: ["getItems", key], exact: false })
      );
    },
  });
};

// ── DELETE ──────────────────────────────────────────────────────────────────
export const useDeleteItem = (path: string, keys?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await axiosAPI.delete(`/${path}/${id}/`);
      return res.data;
    },
    onSuccess: () => {
      const invalidate = keys ?? [path];
      invalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: ["getItems", key], exact: false })
      );
    },
  });
};

// ── UPDATE (PATCH) ──────────────────────────────────────────────────────────
export const useUpdateItem = (
  path: string,
  media_type = false,
  keys?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown> | FormData) => {
      const id =
        data instanceof FormData
          ? data.get("id")
          : (data as Record<string, unknown>).id;
      if (!id) throw new Error("ID manquant.");
      const res = await axiosAPI.patch(`/${path}/${id}/`, data, {
        headers: media_type ? { "Content-Type": "multipart/form-data" } : {},
      });
      return res.data;
    },
    onSuccess: () => {
      const invalidate = keys ?? [path];
      invalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: ["getItems", key], exact: false })
      );
    },
  });
};

// ── UPDATE STATUS ───────────────────────────────────────────────────────────
export const useUpdateStatusItem = (path: string, keys?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string | number; status: string }) => {
      const res = await axiosAPI.patch(`/${path}/${data.id}/`, { status: data.status });
      return res.data;
    },
    onSuccess: () => {
      const invalidate = keys ?? [path];
      invalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: ["getItems", key], exact: false })
      );
    },
  });
};

// ── MARK NOTIFICATION READ ──────────────────────────────────────────────────
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosAPI.patch(`/notifications/${id}/read/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getItems", "notifications"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["notifications", "count"] });
    },
  });
};
