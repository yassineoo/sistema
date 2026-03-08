"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, RotateCcw, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import {
  useGetOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
} from "@/hooks/orders";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import StatusBadge from "@/components/shared/status-badge";
import Pagination from "@/components/shared/pagination";
import type { OrderStatus, DeliveryType } from "@/types/api";

const PAGE_SIZE = 20;

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const DELIVERY_TYPES: DeliveryType[] = ["home", "office"];

const ORDERING_OPTIONS = [
  { value: "-created_at", label: "Plus récent" },
  { value: "created_at", label: "Plus ancien" },
  { value: "-total", label: "Total décroissant" },
  { value: "total", label: "Total croissant" },
];

function formatCurrency(value: string | number) {
  return `${Number(value).toLocaleString("fr-DZ")} DA`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface DeleteDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteDialog({ onConfirm, onCancel, loading }: DeleteDialogProps) {
  const t = useTranslations("orders");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-secondary-900">
          {t("deleteConfirm")}
        </h3>
        <p className="mt-1 text-sm text-secondary-500">
          {t("deleteConfirmDesc")}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "..." : t("confirm")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrdersPage() {
  const t = useTranslations("orders");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    status: OrderStatus;
  } | null>(null);

  const { data, isLoading, isError } = useGetOrders(
    search,
    page,
    status,
    wilayaCode,
    deliveryType,
    dateFrom,
    dateTo,
    ordering
  );

  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  function handleReset() {
    setSearch("");
    setStatus("");
    setWilayaCode("");
    setDeliveryType("");
    setDateFrom("");
    setDateTo("");
    setOrdering("-created_at");
    setPage(1);
  }

  async function handleStatusChange(id: number, newStatus: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("errorLoading"));
    }
  }

  async function handleDelete() {
    if (deleteId == null) return;
    try {
      await deleteOrder.mutateAsync(deleteId);
      toast.success(t("deleted"));
      setDeleteId(null);
    } catch {
      toast.error(t("errorLoading"));
    }
  }

  const orders = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-secondary-500">{t("subtitle")}</p>
        </div>
        {total > 0 && (
          <span className="text-sm text-secondary-500">
            {total} résultats
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-secondary-100 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("search")}
            className="h-9 w-full rounded-lg border border-secondary-200 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">{t("filterAll")}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Wilaya */}
        <input
          type="text"
          value={wilayaCode}
          onChange={(e) => { setWilayaCode(e.target.value); setPage(1); }}
          placeholder={t("filterWilaya")}
          className="h-9 w-24 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />

        {/* Delivery type */}
        <select
          value={deliveryType}
          onChange={(e) => { setDeliveryType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">{t("filterDelivery")}</option>
          {DELIVERY_TYPES.map((d) => (
            <option key={d} value={d}>
              {d === "home" ? t("home") : t("office")}
            </option>
          ))}
        </select>

        {/* Date from */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />

        {/* Date to */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />

        {/* Ordering */}
        <select
          value={ordering}
          onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          {ORDERING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-secondary-200 px-3 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
        >
          <RotateCcw size={14} />
          Réinitialiser
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-secondary-100 bg-secondary-50/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("orderNumber")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("customer")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("wilaya")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("delivery")}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-secondary-500">
                  {t("total")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("status")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("date")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {isLoading ? (
                <TableSkeleton rows={8} cols={8} />
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-red-500"
                  >
                    {t("errorLoading")}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-secondary-400"
                  >
                    {t("noOrders")}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-secondary-50/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-secondary-600">
                      #{order.order_number}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-secondary-900">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-secondary-700">
                      {order.customer_wilaya_name || order.customer_wilaya_code}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.delivery_type === "home"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {order.delivery_type === "home"
                          ? t("home")
                          : t("office")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary-600">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as OrderStatus
                          )
                        }
                        disabled={updateStatus.isPending && pendingStatusChange?.id === order.id}
                        onFocus={() =>
                          setPendingStatusChange({
                            id: order.id,
                            status: order.status,
                          })
                        }
                        className="rounded-lg border border-secondary-200 px-2 py-1 text-xs outline-none focus:border-primary-500"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700"
                        >
                          <Eye size={15} />
                        </Link>
                        {(order.status === "pending" ||
                          order.status === "cancelled") && (
                          <button
                            type="button"
                            onClick={() => setDeleteId(order.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Delete dialog */}
      {deleteId != null && (
        <DeleteDialog
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteOrder.isPending}
        />
      )}
    </div>
  );
}
