"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Save, CloudUpload } from "lucide-react";
import { toast } from "sonner";
import {
  useGetDeliveryPricing,
  useUpdateDeliveryPricing,
  useBulkUpdateDeliveryPricing,
} from "@/hooks/delivery";
import type { DeliveryPricing } from "@/types/api";

interface RowState {
  home_delivery: string;
  office_delivery: string;
  is_active: boolean;
  dirty: boolean;
}

type RowMap = Record<number, RowState>;

function buildRowMap(pricing: DeliveryPricing[]): RowMap {
  const map: RowMap = {};
  for (const p of pricing) {
    map[p.wilaya_code] = {
      home_delivery: p.home_delivery ?? "",
      office_delivery: p.office_delivery ?? "",
      is_active: p.is_active,
      dirty: false,
    };
  }
  return map;
}

export default function DeliveryPage() {
  const t = useTranslations("deliveryAdmin");

  const { data: pricing, isLoading, isError } = useGetDeliveryPricing();
  const updateDelivery = useUpdateDeliveryPricing();
  const bulkUpdate = useBulkUpdateDeliveryPricing();

  const [rows, setRows] = useState<RowMap>({});
  const [initialised, setInitialised] = useState(false);

  // Build row map once data loads
  useEffect(() => {
    if (pricing && !initialised) {
      setRows(buildRowMap(pricing));
      setInitialised(true);
    }
  }, [pricing, initialised]);

  function updateRow(
    wilayaCode: number,
    field: keyof Omit<RowState, "dirty">,
    value: string | boolean
  ) {
    setRows((prev) => ({
      ...prev,
      [wilayaCode]: {
        ...prev[wilayaCode],
        [field]: value,
        dirty: true,
      },
    }));
  }

  async function handleRowSave(wilayaCode: number) {
    const row = rows[wilayaCode];
    if (!row) return;
    try {
      await updateDelivery.mutateAsync({
        wilaya_code: wilayaCode,
        payload: {
          home_delivery: row.home_delivery || null,
          office_delivery: row.office_delivery || null,
          is_active: row.is_active,
        },
      });
      setRows((prev) => ({
        ...prev,
        [wilayaCode]: { ...prev[wilayaCode], dirty: false },
      }));
      toast.success(t("updated"));
    } catch {
      toast.error(t("error"));
    }
  }

  async function handleBulkSave() {
    const dirtyRows = Object.entries(rows)
      .filter(([, row]) => row.dirty)
      .map(([code, row]) => ({
        wilaya_code: Number(code),
        home_delivery: row.home_delivery || null,
        office_delivery: row.office_delivery || null,
        is_active: row.is_active,
      }));

    if (dirtyRows.length === 0) {
      toast.info("Aucune modification à enregistrer");
      return;
    }

    try {
      await bulkUpdate.mutateAsync(dirtyRows);
      // Mark all as clean
      setRows((prev) => {
        const next = { ...prev };
        for (const code of Object.keys(next)) {
          next[Number(code)] = { ...next[Number(code)], dirty: false };
        }
        return next;
      });
      toast.success(`${dirtyRows.length} tarifs mis à jour`);
    } catch {
      toast.error(t("error"));
    }
  }

  const dirtyCount = Object.values(rows).filter((r) => r.dirty).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-secondary-500">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={handleBulkSave}
          disabled={bulkUpdate.isPending || dirtyCount === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <CloudUpload size={16} />
          {bulkUpdate.isPending
            ? "..."
            : `${t("bulkSave")}${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-secondary-100 bg-secondary-50/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("wilayaCode")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("wilayaName")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("homeDelivery")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("officeDelivery")}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-secondary-500">
                  {t("status")}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">
                  {t("save")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-secondary-100 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-red-500"
                  >
                    {t("errorLoading")}
                  </td>
                </tr>
              ) : !pricing || pricing.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-secondary-400"
                  >
                    {t("noDelivery")}
                  </td>
                </tr>
              ) : (
                pricing.map((p) => {
                  const row = rows[p.wilaya_code];
                  if (!row) return null;
                  return (
                    <motion.tr
                      key={p.wilaya_code}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors ${row.dirty ? "bg-amber-50/50" : "hover:bg-secondary-50/50"}`}
                    >
                      {/* Wilaya code */}
                      <td className="px-4 py-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                          {p.wilaya_code}
                        </span>
                      </td>

                      {/* Wilaya name */}
                      <td className="px-4 py-2.5 font-medium text-secondary-900">
                        {p.wilaya_name}
                      </td>

                      {/* Home delivery input */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min={0}
                          value={row.home_delivery}
                          onChange={(e) =>
                            updateRow(p.wilaya_code, "home_delivery", e.target.value)
                          }
                          className="h-8 w-24 rounded-lg border border-secondary-200 px-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          placeholder="—"
                        />
                      </td>

                      {/* Office delivery input */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min={0}
                          value={row.office_delivery}
                          onChange={(e) =>
                            updateRow(p.wilaya_code, "office_delivery", e.target.value)
                          }
                          className="h-8 w-24 rounded-lg border border-secondary-200 px-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          placeholder="—"
                        />
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.is_active}
                          onClick={() =>
                            updateRow(p.wilaya_code, "is_active", !row.is_active)
                          }
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                            row.is_active ? "bg-primary-600" : "bg-secondary-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                              row.is_active ? "translate-x-4" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Row save */}
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => handleRowSave(p.wilaya_code)}
                          disabled={!row.dirty || updateDelivery.isPending}
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-40"
                        >
                          <Save size={12} />
                          {t("save")}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
