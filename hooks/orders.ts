import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type {
  PaginatedResponse,
  Order,
  OrderStats,
  CreateOrderPayload,
  TrackOrderResponse,
  OrderStatus,
} from "@/types/api";

// ── Admin — list & detail ─────────────────────────────────────────────────────

export const useGetOrders = (
  search: string,
  page: number,
  status: string,
  wilayaCode: string,
  deliveryType: string,
  dateFrom: string,
  dateTo: string,
  ordering: string
) => {
  return useQuery({
    queryKey: [
      "orders",
      search,
      page,
      status,
      wilayaCode,
      deliveryType,
      dateFrom,
      dateTo,
      ordering,
    ],
    queryFn: async () => {
      const { data } = await axiosAPI.get<PaginatedResponse<Order>>(
        "api/orders/",
        {
          params: {
            search,
            page,
            status,
            wilaya_code: wilayaCode,
            delivery_type: deliveryType,
            date_from: dateFrom,
            date_to: dateTo,
            ordering,
          },
        }
      );
      return data;
    },
  });
};

export const useGetOrderDetail = (id: number) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await axiosAPI.get<Order>(`api/orders/${id}/`);
      return data;
    },
    enabled: !!id,
  });
};

// ── Admin — mutations ─────────────────────────────────────────────────────────

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: OrderStatus;
    }) => {
      const { data } = await axiosAPI.patch<Order>(
        `api/orders/${id}/status/`,
        { status }
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", id] });
    },
  });
};

export const useUpdateOrderNotes = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const { data } = await axiosAPI.patch<Order>(
        `api/orders/${id}/notes/`,
        { notes }
      );
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["order", id] });
    },
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosAPI.delete(`api/orders/${id}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// ── Public — place order ──────────────────────────────────────────────────────

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await axiosAPI.post<Order>("api/orders/", payload);
      return data;
    },
  });
};

// ── Public — track order ──────────────────────────────────────────────────────

export const useTrackOrder = (orderNumber: string) => {
  return useQuery({
    queryKey: ["trackOrder", orderNumber],
    queryFn: async () => {
      const { data } = await axiosAPI.get<TrackOrderResponse>(
        `api/orders/track/${orderNumber}/`
      );
      return data;
    },
    enabled: !!orderNumber,
  });
};

// ── Admin — stats ─────────────────────────────────────────────────────────────

export const useGetOrderStats = () => {
  return useQuery({
    queryKey: ["orderStats"],
    queryFn: async () => {
      const { data } = await axiosAPI.get<OrderStats>("api/orders/stats/");
      return data;
    },
  });
};
