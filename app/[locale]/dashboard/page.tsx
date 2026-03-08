"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  CalendarDays,
  TrendingUp,
  PackageSearch,
} from "lucide-react";
import { useGetOrderStats } from "@/hooks/orders";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import StatusBadge from "@/components/shared/status-badge";
import type { OrderStatus } from "@/types/api";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-purple-100 text-purple-700 border-purple-200",
  shipped: "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

function formatCurrency(value: number) {
  return `${Number(value).toLocaleString("fr-DZ")} DA`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  index: number;
}

function StatCard({ icon, value, label, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm"
    >
      {/* Green left accent bar */}
      <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-primary-600" />
      <div className="flex items-start justify-between pl-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          {icon}
        </div>
      </div>
      <div className="mt-4 pl-2">
        <p className="text-2xl font-bold text-secondary-900">{value}</p>
        <p className="mt-1 text-sm font-medium text-secondary-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data: stats, isLoading, isError } = useGetOrderStats();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-secondary-500">{t("subtitle")}</p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : isError || !stats ? (
        <p className="text-sm text-red-500">{t("errorLoading")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<ShoppingCart size={20} />}
            value={String(stats.today.orders_count)}
            label={`${t("today")} — ${t("ordersCount")}`}
            index={0}
          />
          <StatCard
            icon={<DollarSign size={20} />}
            value={formatCurrency(stats.today.revenue)}
            label={`${t("today")} — ${t("revenue")}`}
            index={1}
          />
          <StatCard
            icon={<CalendarDays size={20} />}
            value={String(stats.this_month.orders_count)}
            label={`${t("thisMonth")} — ${t("ordersCount")}`}
            index={2}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            value={formatCurrency(stats.this_month.revenue)}
            label={`${t("thisMonth")} — ${t("revenue")}`}
            index={3}
          />
        </div>
      )}

      {/* Orders by status */}
      {stats && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.35 }}
          className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-base font-semibold text-secondary-900">
            {t("byStatus")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {ORDER_STATUSES.map((status) => (
              <div
                key={status}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${STATUS_COLORS[status]}`}
              >
                <StatusBadge status={status} />
                <span className="font-bold">
                  {stats.by_status[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        {stats && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.35 }}
            className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-secondary-900">
              {t("recentOrders")}
            </h2>
            {stats.recent_orders.length === 0 ? (
              <p className="text-sm text-secondary-400">{t("noData")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-100">
                      <th className="pb-2 text-left font-semibold text-secondary-500">
                        N°
                      </th>
                      <th className="pb-2 text-left font-semibold text-secondary-500">
                        Client
                      </th>
                      <th className="pb-2 text-right font-semibold text-secondary-500">
                        Total
                      </th>
                      <th className="pb-2 text-left font-semibold text-secondary-500 pl-4">
                        Statut
                      </th>
                      <th className="pb-2 text-right font-semibold text-secondary-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {stats.recent_orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-secondary-50/50">
                        <td className="py-3 font-mono text-xs text-secondary-600">
                          #{order.order_number}
                        </td>
                        <td className="py-3 font-medium text-secondary-900">
                          {order.customer_name}
                        </td>
                        <td className="py-3 text-right font-semibold text-primary-600">
                          {formatCurrency(Number(order.total))}
                        </td>
                        <td className="py-3 pl-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 text-right text-xs text-secondary-500">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>
        )}

        {/* Top products */}
        {stats && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.35 }}
            className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-secondary-900">
              {t("topProducts")}
            </h2>
            {stats.top_products.length === 0 ? (
              <p className="text-sm text-secondary-400">{t("noData")}</p>
            ) : (
              <ul className="space-y-3">
                {stats.top_products.slice(0, 5).map((product, index) => (
                  <li
                    key={product.product_id}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                      {index + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-secondary-900">
                        {product.product_name}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-secondary-600">
                        {product.total_sold}{" "}
                        <span className="font-normal text-secondary-400">
                          {t("unitsSold")}
                        </span>
                      </span>
                    </div>
                    <PackageSearch size={16} className="shrink-0 text-secondary-300" />
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}
