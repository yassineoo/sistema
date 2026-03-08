import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { User } from "@/types/schema";

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthenticate = () => {
  return useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await axiosAPI.post("/auth/login/", data);
      return response.data;
    },
  });
};

export const useGetUserInfo = () => {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const res = await axiosAPI.get("/auth/get_user_info/");
      return res.data;
    },
  });
};

export const useMyProfile = () => {
  return useQuery<User>({
    queryKey: ["auth", "me", "profile"],
    queryFn: async () => {
      const res = await axiosAPI.get("/auth/me/profile/");
      return res.data as User;
    },
  });
};

export interface UpdateMyProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export const useUpdateMyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateMyProfilePayload) => {
      const res = await axiosAPI.patch("/auth/me/profile/", data);
      return res.data as User;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me", "profile"] });
      qc.invalidateQueries({ queryKey: ["auth", "user"] });
    },
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

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await axiosAPI.post("/auth/forgot-password/", payload);
      return res.data as { detail: string };
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: {
      uid: string;
      token: string;
      new_password: string;
      confirm_password: string;
    }) => {
      const res = await axiosAPI.post("/auth/reset-password/", payload);
      return res.data as { detail: string };
    },
  });
};
