import { useQuery } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import { mockAPI } from "@/services/mockAPI";

export const useReportStats = () =>
  useQuery({
    queryKey: ["reports"],
    queryFn: mockAPI.getReportStats,
  });

export interface ActivityLog {
  id: number;
  /** Legacy plain-text action (fallback) */
  action?: string;
  /** Translated action text from backend */
  action_fr?: string;
  action_ar?: string;
  user_name?: string;
  created_at: string;
}

export interface ActivityFilters {
  user?: number;
  date_from?: string;
  date_to?: string;
}

export interface ActivityPage {
  results:  ActivityLog[];
  count:    number;
  next:     string | null;
  previous: string | null;
}

export const useActivityFeed = (page = 1, page_size = 10, filters?: ActivityFilters) =>
  useQuery<ActivityPage>({
    queryKey: ["activity", page, filters, page_size],
    queryFn: async () => {
      const res = await axiosAPI.get("/activity-logs/", {
        params: { ...filters, page, page_size },
      });
      // Handle both paginated ({count, results}) and plain array responses
      if (Array.isArray(res.data)) {
        return { results: res.data as ActivityLog[], count: res.data.length, next: null, previous: null };
      }
      return res.data as ActivityPage;
    },
  });
