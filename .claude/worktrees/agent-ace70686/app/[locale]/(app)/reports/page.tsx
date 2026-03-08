"use client";

import { useTranslations } from "next-intl";
import { BarChart2, FileText, FileSpreadsheet, TrendingUp, Users, Wallet, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import { useReportStats } from "@/hooks/reports";

function SkeletonBlock({ h = "h-40" }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-2xl bg-secondary-100`} />;
}

const STATUS_LABELS: Record<string, string> = {
  en_attente:            "En attente",
  en_cours_de_traitement:"En cours",
  terminée:              "Terminées",
  revision_requise:      "Révision requise",
  en_cours_de_revision:  "En cours de révision",
};
const STATUS_COLORS: Record<string, string> = {
  en_attente:            "bg-amber-100   text-amber-700",
  en_cours_de_traitement:"bg-blue-100    text-blue-700",
  terminée:              "bg-emerald-100 text-emerald-700",
  revision_requise:      "bg-orange-100  text-orange-700",
  en_cours_de_revision:  "bg-purple-100  text-purple-700",
};

export default function ReportsPage() {
  const t  = useTranslations("Pages.Reports");
  const tp = useTranslations("Pages");

  const { data, isLoading, isError, refetch } = useReportStats();

  const maxAmount = data ? Math.max(...data.weekly.map((d) => d.amount)) : 1;
  const topMax    = data?.topClients[0]?.total ?? 1;

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader title={t("title")} subtitle={t("subtitle")} icon={BarChart2}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 shadow-sm transition-colors hover:bg-secondary-50">
              <FileSpreadsheet size={15} className="text-emerald-600" />{tp("exportExcel")}
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700">
              <FileText size={15} />{tp("exportPDF")}
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-8 space-y-6">

        {isError && <ErrorState onRetry={refetch} message="Impossible de charger les rapports." />}

        {/* Summary cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">{[1,2,3].map((i) => <SkeletonBlock key={i} h="h-28" />)}</div>
        ) : data && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: Wallet,     label: "Total encaissé",     value: `${data.totalRevenu.toLocaleString("fr-DZ")} DZD`, color: "text-primary-600  bg-primary-50"  },
              { icon: Clock,      label: "Reste à encaisser",  value: `${data.totalReste.toLocaleString("fr-DZ")} DZD`,  color: "text-amber-600   bg-amber-50"    },
              { icon: TrendingUp, label: "Commandes terminées",value: `${data.terminées} / ${data.totalCmds}`,           color: "text-emerald-600 bg-emerald-50"  },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={18} /></div>
                <p className="mt-4 text-xl font-bold text-secondary-900">{value}</p>
                <p className="mt-1 text-sm text-secondary-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* Bar chart */}
          {isLoading ? <SkeletonBlock h="h-64" /> : data && (
            <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-semibold text-secondary-900">{t("salesByDay")}</h2>
                <span className="text-xs text-secondary-400">Cette semaine</span>
              </div>
              <div className="flex items-end gap-2 h-44">
                {data.weekly.map((d) => {
                  const pct = Math.round((d.amount / maxAmount) * 100);
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-medium text-secondary-400">{Math.round(d.amount / 1000)}k</span>
                      <div className="w-full rounded-t-lg bg-primary-100 relative" style={{ height: "100%" }}>
                        <div className="absolute bottom-0 w-full rounded-t-lg bg-primary-600 transition-all duration-700" style={{ height: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-secondary-400">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top clients */}
          {isLoading ? <SkeletonBlock h="h-64" /> : data && (
            <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-semibold text-secondary-900">{t("topClients")}</h2>
                <span className="flex items-center gap-1 text-xs text-secondary-400"><Users size={12} />{data.topClients.length} clients</span>
              </div>
              <div className="space-y-4">
                {data.topClients.slice(0, 5).map((entry, i) => {
                  const pct      = Math.round((entry.total / topMax) * 100);
                  const versePct = entry.total > 0 ? Math.round((entry.verse / entry.total) * 100) : 0;
                  return (
                    <div key={entry.client.id}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-[10px] font-bold text-secondary-600">{i + 1}</span>
                          <span className="text-sm font-medium text-secondary-800">{entry.client.first_name} {entry.client.last_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-secondary-900">{entry.total.toLocaleString("fr-DZ")} DZD</span>
                          <span className="ml-2 text-xs text-emerald-600">{versePct}% versé</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary-100">
                        <div className="h-full rounded-full bg-primary-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status breakdown */}
        {!isLoading && !isError && data && (
          <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-secondary-900">Répartition par statut</h2>
            <div className="flex flex-wrap gap-3">
              {data.byStatus.map(({ status, count }) => (
                <div key={status} className={`flex items-center gap-2 rounded-xl px-4 py-2 ${STATUS_COLORS[status]}`}>
                  <span className="text-sm font-bold">{count}</span>
                  <span className="text-xs font-medium">{STATUS_LABELS[status]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
