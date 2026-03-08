"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft, ClipboardList, Clock, CheckCircle2,
  AlertCircle, RefreshCw, Loader2, Zap,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useClientCommandeHistory } from "@/hooks/commandes";
import { useGetItem } from "@/hooks/query";
import type { Client, CommandeListItem, CommandeStatus } from "@/types/schema";

const STATUS_ICON: Record<CommandeStatus, React.ElementType> = {
  en_attente:             Clock,
  en_cours_de_traitement: Loader2,
  terminée:               CheckCircle2,
  revision_requise:       AlertCircle,
  en_cours_de_revision:   RefreshCw,
};

const STATUS_CLASSES: Record<CommandeStatus, string> = {
  en_attente:             "bg-amber-100   text-amber-700",
  en_cours_de_traitement: "bg-blue-100    text-blue-700",
  terminée:               "bg-emerald-100 text-emerald-700",
  revision_requise:       "bg-orange-100  text-orange-700",
  en_cours_de_revision:   "bg-purple-100  text-purple-700",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "2-digit" });

const formatMoney = (val: string | number) => {
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? "—" : `${n.toLocaleString("fr-DZ")} DA`;
};

export default function ClientHistoryPage() {
  const t = useTranslations("Pages.ClientHistory");
  const ts = useTranslations("Pages.Statuses");

  const params = useParams();
  const clientId = Number(params.id);

  const { data: clientData, isLoading: clientLoading } = useGetItem("clients", clientId);
  const { data: commandes, isLoading, isError, refetch } = useClientCommandeHistory(clientId);

  const client = clientData as Client | undefined;
  const orders = (commandes ?? []) as CommandeListItem[];

  const stats = {
    total: orders.length,
    en_attente: orders.filter((o) => o.status === "en_attente").length,
    terminée: orders.filter((o) => o.status === "terminée").length,
    urgent: orders.filter((o) => o.is_urgent).length,
  };

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title={clientLoading ? t("title") : `${client?.first_name ?? ""} ${client?.last_name ?? ""}`}
        subtitle={t("subtitle")}
        icon={ClipboardList}
        actions={
          <Link
            href="/clients"
            className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-600 shadow-sm transition-colors hover:bg-secondary-50"
          >
            <ArrowLeft size={15} />
            {t("back")}
          </Link>
        }
      />

      <div className="p-4 sm:p-8 space-y-5">
        {isError && <ErrorState onRetry={refetch} message={t("errorLoading")} />}

        {/* Summary strip */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("total"),     value: stats.total,      color: "text-secondary-900" },
              { label: t("pending"),   value: stats.en_attente, color: "text-amber-700" },
              { label: t("completed"), value: stats.terminée,   color: "text-emerald-700" },
              { label: t("urgent"),    value: stats.urgent,     color: "text-red-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-secondary-100 bg-white px-4 py-3 shadow-sm">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-secondary-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {!isError && (
          <div className="overflow-x-auto rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <table className="min-w-175 w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">#</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("description")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("amount")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("deadline")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("status")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("createdOn")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {isLoading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : orders.length === 0 ? (
                  <EmptyState icon={ClipboardList} label={t("noOrders")} colSpan={6} />
                ) : (
                  orders.map((cmd) => {
                    const StatusIcon = STATUS_ICON[cmd.status];
                    return (
                      <tr key={cmd.id} className="transition-colors hover:bg-secondary-50">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="rounded bg-secondary-100 px-2 py-0.5 font-mono text-xs font-semibold text-secondary-500">
                              #{cmd.id}
                            </span>
                            {cmd.is_urgent && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-700">
                                <Zap size={8} />URGENT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-50 truncate text-secondary-700">{cmd.client_name}</td>
                        <td className="px-6 py-4 tabular-nums text-secondary-700">{formatMoney(cmd.prix_total)}</td>
                        <td className="px-6 py-4 tabular-nums text-secondary-500">{formatDate(cmd.delai)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[cmd.status]}`}>
                            <StatusIcon size={11} />
                            {ts(cmd.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary-400 tabular-nums">{formatDate(cmd.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
