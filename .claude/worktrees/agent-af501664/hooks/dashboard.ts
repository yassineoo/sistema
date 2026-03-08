import { useQuery } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { CommandeStatus } from "@/types/schema";

export interface DashboardRecentCmd {
  id: number;
  description: string;
  prix_total: number;
  status: CommandeStatus;
  created_at: string;
  client: { id: number; first_name: string; last_name: string } | null;
}

export interface DashboardNotification {
  id: number;
  type: "nouvelle_commande" | "revision_requise";
  is_read: boolean;
  created_at: string;
  commande: {
    id: number;
    client: { first_name: string; last_name: string } | null;
  };
}

export interface DashboardStats {
  totalCmds: number;
  pendingCmds: number;
  totalClients: number;
  totalRevenu: number;
  totalReste: number;
  unreadNotifs: number;
  recentCmds: DashboardRecentCmd[];
  notifications: DashboardNotification[];
}

export interface OrdersByDayPoint {
  date: string;
  label: string;
  count: number;
}

export const useDashboardStats = () =>
  useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const res = await axiosAPI.get("/dashboard/stats/");
      return res.data as DashboardStats;
    },
  });

export const useOrdersByDay = () =>
  useQuery<OrdersByDayPoint[]>({
    queryKey: ["dashboard", "orders-by-day"],
    queryFn: async () => {
      const res = await axiosAPI.get("/dashboard/orders-by-day/");
      return res.data as OrdersByDayPoint[];
    },
  });
