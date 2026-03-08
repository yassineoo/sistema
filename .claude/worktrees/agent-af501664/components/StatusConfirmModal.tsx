"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { CommandeStatus } from "@/types/schema";

const STATUS_CLASSES: Record<CommandeStatus, string> = {
  en_attente:             "bg-amber-100   text-amber-700",
  en_cours_de_traitement: "bg-blue-100    text-blue-700",
  terminée:               "bg-emerald-100 text-emerald-700",
  revision_requise:       "bg-orange-100  text-orange-700",
  en_cours_de_revision:   "bg-purple-100  text-purple-700",
};

interface StatusConfirmModalProps {
  orderId: number;
  currentStatus: CommandeStatus;
  newStatus: CommandeStatus;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function StatusConfirmModal({
  orderId,
  currentStatus,
  newStatus,
  onConfirm,
  onCancel,
  isPending,
}: StatusConfirmModalProps) {
  const t = useTranslations("Pages.StatusConfirm");
  const ts = useTranslations("Pages.Statuses");

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm rounded-2xl border border-secondary-100 bg-white p-6 shadow-2xl pointer-events-auto">
          <h3 className="text-base font-bold text-secondary-900 mb-1">{t("title")}</h3>
          <p className="text-sm text-secondary-500 mb-5">
            {t("orderRef")}{" "}
            <span className="font-mono font-semibold text-secondary-700">#{orderId}</span>
          </p>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_CLASSES[currentStatus]}`}>
              {ts(currentStatus)}
            </span>
            <ArrowRight size={16} className="shrink-0 text-secondary-400" />
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_CLASSES[newStatus]}`}>
              {ts(newStatus)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 cursor-pointer rounded-xl border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 disabled:opacity-60"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {t("confirm")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
