import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { User } from "@/types/schema";

const USERS_KEY = ["auth", "users"];

// ── Queries ────────────────────────────────────────────────────────────────────

export const useUsers = (filter: any) =>
  useQuery<any>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const res = await axiosAPI.get("/auth/users/", { params: filter });
      return res.data as User[];
    },
  });

export const useUser = (id?: number) =>
  useQuery<User>({
    queryKey: [...USERS_KEY, id],
    queryFn: async () => {
      const res = await axiosAPI.get(`/auth/users/${id}/`);
      return res.data as User;
    },
    enabled: !!id,
  });

// ── Mutations ──────────────────────────────────────────────────────────────────

export interface UserPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: User["role"];
  password?: string;
  is_active?: boolean;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Required<UserPayload>) => {
      const res = await axiosAPI.post("/auth/users/", data);
      return res.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: number; data: Omit<UserPayload, "password"> }) => {
      const res = await axiosAPI.patch(`/auth/users/${params.id}/`, params.data);
      return res.data as User;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_KEY, variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosAPI.delete(`/auth/users/${id}/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosAPI.patch(`/auth/users/${id}/activate/`);
      return res.data as { detail: string };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_KEY, id] });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosAPI.patch(`/auth/users/${id}/deactivate/`);
      return res.data as { detail: string };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_KEY, id] });
    },
  });
};

export const useAdminChangePassword = () => {
  return useMutation({
    mutationFn: async (params: { id: number; new_password: string; confirm_password: string }) => {
      const res = await axiosAPI.post(`/auth/users/${params.id}/change-password/`, {
        new_password: params.new_password,
        confirm_password: params.confirm_password,
      });
      return res.data as { detail: string };
    },
  });
};
