import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosAPI } from "@/lib/constant";
import { useGetItems, useMarkNotificationRead as useMarkRead } from "./query";

export const useNotifications = (page = 1, page_size = 10) =>
  useGetItems("notifications", page, page_size);

export const useNotificationCount = () =>
  useQuery({
    queryKey: ["notifications", "count"],
    queryFn: async () => {
      const res = await axiosAPI.get("/notifications/count/");
      return res.data as { unread_count: number };
    },
  });

export const useMarkNotificationRead = () => useMarkRead();

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosAPI.post("/notifications/read_all/");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getItems", "notifications"], exact: false });
      qc.invalidateQueries({ queryKey: ["notifications", "count"] });
      toast.success("Toutes les notifications marquées comme lues");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
};
