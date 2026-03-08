"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import {
  useGetOrderDetail,
  useUpdateOrderStatus,
  useUpdateOrderNotes,
} from "@/hooks/orders";
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wide text-secondary-400">
        {label}
      </span>
      <span className="text-sm text-secondary-900">{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const t = useTranslations("orders");

  const { data: order, isLoading, isError } = useGetOrderDetail(id);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState("");
  const [notesInitialised, setNotesInitialised] = useState(false);

  const updateStatus = useUpdateOrderStatus();
  const updateNotes = useUpdateOrderNotes();

  // Initialise local state once order loads
  if (order && !notesInitialised) {
    setNotes(order.notes ?? "");
    setSelectedStatus(order.status);
    setNotesInitialised(true);
  }

  async function handleStatusUpdate() {
    if (!selectedStatus || selectedStatus === order?.status) return;
    try {
      await updateStatus.mutateAsync({ id, status: selectedStatus });
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("errorLoading"));
    }
  }

  async function handleSaveNotes() {
    try {
      await updateNotes.mutateAsync({ id, notes });
      toast.success(t("notesUpdated"));
    } catch {
      toast.error(t("errorLoading"));
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">{t("errorLoading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-secondary-500 hover:text-primary-600"
      >
        <ArrowLeft size={16} />
        Retour aux commandes
      </Link>

      {/* Page title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Commande #{order.order_number}
          </h1>
          <p className="mt-1 text-sm text-secondary-500">
            {formatDate(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Status update bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-secondary-100 bg-white p-4 shadow-sm"
      >
        <span className="text-sm font-semibold text-secondary-700">
          {t("changeStatus")} :
        </span>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
          className="rounded-lg border border-secondary-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleStatusUpdate}
          disabled={
            updateStatus.isPending || selectedStatus === order.status
          }
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {updateStatus.isPending ? "..." : t("confirm")}
        </button>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT column */}
        <div className="space-y-5">
          {/* Customer info */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm divide-y divide-secondary-50"
          >
            <h2 className="pb-3 text-base font-semibold text-secondary-900">
              Informations client
            </h2>
            <div className="pt-3 space-y-0.5">
              <InfoRow label="Nom" value={order.customer_name} />
              <InfoRow label="Téléphone" value={order.customer_phone} />
              {order.customer_phone2 && (
                <InfoRow label="Téléphone 2" value={order.customer_phone2} />
              )}
            </div>
          </motion.section>

          {/* Delivery info */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm divide-y divide-secondary-50"
          >
            <h2 className="pb-3 text-base font-semibold text-secondary-900">
              Livraison
            </h2>
            <div className="pt-3 space-y-0.5">
              <InfoRow
                label="Wilaya"
                value={`${order.customer_wilaya_code} — ${order.customer_wilaya_name}`}
              />
              <InfoRow label="Adresse" value={order.customer_address} />
              <InfoRow
                label="Mode"
                value={
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.delivery_type === "home"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {order.delivery_type === "home" ? t("home") : t("office")}
                  </span>
                }
              />
            </div>
          </motion.section>

          {/* Notes */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-3 text-base font-semibold text-secondary-900">
              {t("notes")}
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              rows={4}
              className="w-full rounded-xl border border-secondary-200 p-3 text-sm outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={updateNotes.isPending}
              className="mt-3 flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={15} />
              {updateNotes.isPending ? "..." : t("saveNotes")}
            </button>
          </motion.section>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5">
          {/* Items table */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm"
          >
            <div className="px-5 py-4 border-b border-secondary-100">
              <h2 className="text-base font-semibold text-secondary-900">
                Articles
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-secondary-500">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-secondary-500">
                      Qté
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-secondary-500">
                      P.U.
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-secondary-500">
                      Sous-total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3 font-medium text-secondary-900">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-right text-secondary-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-secondary-700">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-secondary-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Order totals */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm space-y-2"
          >
            <h2 className="mb-4 text-base font-semibold text-secondary-900">
              Récapitulatif
            </h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-500">Sous-total</span>
              <span className="font-medium text-secondary-900">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-500">Frais de livraison</span>
              <span className="font-medium text-secondary-900">
                {formatCurrency(order.delivery_price)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-secondary-100 pt-3 text-base">
              <span className="font-bold text-secondary-900">Total</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
