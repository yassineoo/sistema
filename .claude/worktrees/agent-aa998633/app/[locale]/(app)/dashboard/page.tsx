"use client";

import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  Loader2,
  DollarSign,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import PageHeader from "@/components/PageHeader";
import CardSkeleton from "@/components/ui/CardSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import { useDashboardStats, useOrdersByDay } from "@/hooks/dashboard";
import { useMarkNotificationRead } from "@/hooks/notifications";
import type { CommandeStatus } from "@/types/schema";
import type { DashboardRecentCmd, DashboardNotification } from "@/hooks/dashboard";

const STATUS_ICON: Record<string, React.ElementType> = {
  en_attente: Clock,
  en_cours_de_traitement: Loader2,
  terminée: CheckCircle2,
  revision_requise: AlertCircle,
  en_cours_de_revision: RefreshCw,
};
const STATUS_CLASSES: Record<string, string> = {
  en_attente: "bg-amber-100   text-amber-700",
  en_cours_de_traitement: "bg-blue-100    text-blue-700",
  terminée: "bg-emerald-100 text-emerald-700",
  revision_requise: "bg-orange-100  text-orange-700",
  en_cours_de_revision: "bg-purple-100  text-purple-700",
};

// ── Custom tooltip for bar chart ──────────────────────────────────────────────
function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  const t = useTranslations("Pages.Dashboard");
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-secondary-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-secondary-700">{label}</p>
      <p className="text-primary-600 font-bold">
        {payload[0].value} {t("ordersLabel").toLowerCase()}
      </p>
    </div>
  );
}

// ── Donut summary ─────────────────────────────────────────────────────────────
function DonutSummary({ encaisse, reste }: { encaisse: number; reste: number }) {
  const t = useTranslations("Pages.Dashboard");
  const total = encaisse + reste;
  const pct = total > 0 ? Math.round((encaisse / total) * 100) : 0;
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {t("encaisse")}
        </span>
        <span className="font-semibold text-secondary-700">{encaisse.toLocaleString("fr-DZ")} DZD</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-600" />
          {t("remainingToPay")}
        </span>
        <span className="font-semibold text-secondary-700">{reste.toLocaleString("fr-DZ")} DZD</span>
      </div>
      <div className="mt-2 rounded-lg bg-secondary-50 px-3 py-2 text-center">
        <span className="text-lg font-bold text-secondary-900">{pct}%</span>
        <span className="ml-1 text-xs text-secondary-400">{t("encaisseLabel")}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("Pages.Dashboard");
  const tp = useTranslations("Pages");
  const ts = useTranslations("Pages.Statuses");

  const { data, isLoading, isError, refetch } = useDashboardStats();
  const { data: ordersByDay, isLoading: isLoadingChart } = useOrdersByDay();
  const markRead = useMarkNotificationRead();

  const stats = data
    ? [
        {
          icon: ClipboardList,
          label: t("ordersLabel"),
          value: data.totalCmds,
          sub: `${data.pendingCmds} ${t("pendingOrders")}`,
          color: "text-primary-600 bg-primary-50",
        },
        {
          icon: Users,
          label: tp("clients"),
          value: data.totalClients,
          sub: t("clientsRegistered"),
          color: "text-blue-600    bg-blue-50",
        },
        {
          icon: TrendingUp,
          label: t("encaisse"),
          value: `${data.totalRevenu.toLocaleString("fr-DZ")} DZD`,
          sub: t("totalVersements"),
          color: "text-emerald-600 bg-emerald-50",
        },
        {
          icon: DollarSign,
          label: t("restLabel"),
          value: `${data.totalReste.toLocaleString("fr-DZ")} DZD`,
          sub: t("toCollectLabel"),
          color: "text-amber-600   bg-amber-50",
        },
      ]
    : [];

  const donutData = data
    ? [
        { name: t("encaisse"), value: data.totalRevenu, fill: "#10b981" },
        { name: t("remainingToPay"), value: data.totalReste, fill: "#D62828" },
      ]
    : [];

  const barData = ordersByDay ?? [];

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={LayoutDashboard}
        actions={
          data && data.totalReste > 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
              <Clock size={14} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                {data.totalReste.toLocaleString("fr-DZ")} DZD {t("toCollect")}
              </span>
            </div>
          ) : undefined
        }
      />

      <div className="p-4 sm:p-8 space-y-6">
        {isError && <ErrorState onRetry={refetch} message={t("errorLoading")} />}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {isLoading ? (
            <CardSkeleton count={4} />
          ) : (
            stats.map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="mt-4 text-2xl font-bold text-secondary-900">{value}</p>
                <p className="mt-0.5 text-sm font-semibold text-secondary-600">{label}</p>
                <p className="mt-0.5 text-xs text-secondary-400">{sub}</p>
              </div>
            ))
          )}
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Bar chart */}
          <div className="xl:col-span-2 rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-secondary-900">{t("ordersByDay")}</h2>
                <p className="text-xs text-secondary-400">{t("last7Days")}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <ClipboardList size={15} />
              </div>
            </div>
            <div className="px-4 pb-4 pt-5">
              {isLoadingChart ? (
                <div className="h-48 animate-pulse rounded-xl bg-secondary-100" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "#f9fafb" }} />
                    <Bar dataKey="count" fill="#D62828" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Donut chart */}
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-secondary-900">{t("payments")}</h2>
                <p className="text-xs text-secondary-400">{t("encaisseVsReste")}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign size={15} />
              </div>
            </div>
            <div className="px-6 py-4">
              {isLoading ? (
                <div className="h-48 animate-pulse rounded-xl bg-secondary-100" />
              ) : data && data.totalRevenu + data.totalReste > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <DonutSummary encaisse={data.totalRevenu} reste={data.totalReste} />
                </>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-secondary-400">{t("noData")}</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Recent commandes */}
          <div className="xl:col-span-2 rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
              <h2 className="font-semibold text-secondary-900">{t("recentOrders")}</h2>
              <span className="text-xs text-secondary-400">
                {tp("today")} — {new Date().toLocaleDateString("fr-DZ")}
              </span>
            </div>
            <div className="divide-y divide-secondary-50">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                      <div className="h-9 w-9 rounded-full bg-secondary-100 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-36 rounded bg-secondary-100" />
                        <div className="h-3 w-48 rounded bg-secondary-100" />
                      </div>
                      <div className="h-5 w-20 rounded-full bg-secondary-100" />
                    </div>
                  ))
                : data?.recentCmds.map((cmd: DashboardRecentCmd) => {
                    const Icon = STATUS_ICON[cmd.status] ?? Clock;
                    const initials = cmd.client ? `${cmd.client.first_name[0]}${cmd.client.last_name[0]}` : "?";
                    const clientName = cmd.client ? `${cmd.client.first_name} ${cmd.client.last_name}` : "—";
                    return (
                      <div key={cmd.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary-50">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-900 text-xs font-bold text-white">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-secondary-800">{clientName}</p>
                          <p className="truncate text-xs text-secondary-400">{cmd.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-secondary-900">{Number(cmd.prix_total).toLocaleString("fr-DZ")} DZD</p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASSES[cmd.status]}`}
                          >
                            <Icon size={9} />
                            {ts(cmd.status as CommandeStatus)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
              <h2 className="font-semibold text-secondary-900">{t("recentActivity")}</h2>
              {data && data.unreadNotifs > 0 && (
                <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {data.unreadNotifs} {t("newNotifications")}
                </span>
              )}
            </div>
            <div className="divide-y divide-secondary-50">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse space-y-2">
                    <div className="h-4 w-40 rounded bg-secondary-100" />
                    <div className="h-3 w-28 rounded bg-secondary-100" />
                  </div>
                ))
              ) : !data?.notifications.length ? (
                <div className="flex flex-col items-center gap-2 py-10 text-secondary-400">
                  <Bell size={28} className="opacity-30" />
                  <p className="text-sm">{t("noNotifications")}</p>
                </div>
              ) : (
                data.notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead.mutateAsync(n.id)}
                    className={`flex cursor-pointer gap-3 px-6 py-4 transition-colors hover:bg-secondary-50 ${!n.is_read ? "bg-primary-50/40" : ""}`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs
                    ${n.type === "nouvelle_commande" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {n.type === "nouvelle_commande" ? <ClipboardList size={12} /> : <AlertCircle size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.is_read ? "font-semibold text-secondary-900" : "text-secondary-600"}`}>
                        {n.type === "nouvelle_commande" ? t("nouvelle_commande") : t("revision_requise")}
                      </p>
                      <p className="truncate text-xs text-secondary-400">
                        #{n?.commande?.id} — {n?.commande?.client?.first_name} {n?.commande?.client?.last_name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-secondary-300">{new Date(n.created_at).toLocaleDateString("fr-DZ")}</p>
                    </div>
                    {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
