"use client";

import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/types/api";

interface StatusBadgeProps {
  status: OrderStatus;
}

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  className: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations("order.status");

  const configs: Record<OrderStatus, StatusConfig> = {
    pending: {
      label: t("pending"),
      icon: <Clock size={13} />,
      className: "bg-amber-100 text-amber-700",
    },
    confirmed: {
      label: t("confirmed"),
      icon: <CheckCircle size={13} />,
      className: "bg-blue-100 text-blue-700",
    },
    processing: {
      label: t("processing"),
      icon: <Package size={13} />,
      className: "bg-purple-100 text-purple-700",
    },
    shipped: {
      label: t("shipped"),
      icon: <Truck size={13} />,
      className: "bg-orange-100 text-orange-700",
    },
    delivered: {
      label: t("delivered"),
      icon: <CheckCircle2 size={13} />,
      className: "bg-emerald-100 text-emerald-700",
    },
    cancelled: {
      label: t("cancelled"),
      icon: <XCircle size={13} />,
      className: "bg-red-100 text-red-700",
    },
  };

  const config = configs[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
