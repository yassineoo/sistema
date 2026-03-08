import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { AdminUser } from "@/types/api";

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthenticate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await axiosAPI.post("/auth/login/", data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
};

export const useGetUserInfo = () => {
  return useQuery<AdminUser>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const res = await axiosAPI.get("/auth/me/");
      return res.data as AdminUser;
    },
    retry: false,
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosAPI.post("/auth/logout/");
      return res.data;
    },
    onSuccess: () => {
      qc.clear();
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: {
      current_password: string;
      new_password: string;
    }) => {
      const res = await axiosAPI.post("/auth/change-password/", payload);
      return res.data;
    },
  });
};
