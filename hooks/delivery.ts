import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosAPI } from "@/lib/constant";
import type { DeliveryPricing } from "@/types/api";

// ── Queries ───────────────────────────────────────────────────────────────────

export const useGetDeliveryPricing = () => {
  return useQuery({
    queryKey: ["deliveryPricing"],
    queryFn: async () => {
      const { data } = await axiosAPI.get<DeliveryPricing[]>(
        "api/delivery-pricing/"
      );
      return data;
    },
  });
};

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useUpdateDeliveryPricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wilaya_code,
      payload,
    }: {
      wilaya_code: number;
      payload: Partial<
        Pick<
          DeliveryPricing,
          "home_delivery" | "office_delivery" | "is_active"
        >
      >;
    }) => {
      const { data } = await axiosAPI.patch<DeliveryPricing>(
        `api/delivery-pricing/${wilaya_code}/`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveryPricing"] });
    },
  });
};

export const useBulkUpdateDeliveryPricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Array<
        Pick<DeliveryPricing, "wilaya_code"> &
          Partial<
            Pick<
              DeliveryPricing,
              "home_delivery" | "office_delivery" | "is_active"
            >
          >
      >
    ) => {
      const { data } = await axiosAPI.post<DeliveryPricing[]>(
        "api/delivery-pricing/bulk-update/",
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveryPricing"] });
    },
  });
};
