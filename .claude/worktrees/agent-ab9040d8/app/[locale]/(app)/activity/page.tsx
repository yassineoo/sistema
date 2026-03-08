"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ScrollText, ClipboardList, LogIn, UserPlus, AlertCircle, CheckCircle2, Bell, Filter, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import { useActivityFeed, type ActivityFilters } from "@/hooks/reports";
import { useNotifications } from "@/hooks/notifications";
import { useUsers } from "@/hooks/users";

const ACTION_META: Record<string, { icon: React.ElementType; color: string; dot: string }> = {
  sale: { icon: ClipboardList, color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  login: { icon: LogIn, color: "bg-blue-100   text-blue-700", dot: "bg-blue-500" },
  clientAdded: { icon: UserPlus, color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  revision: { icon: AlertCircle, color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  completed: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const DEFAULT_META = { icon: ClipboardList, color: "bg-secondary-100 text-secondary-700", dot: "bg-secondary-400" };

function SkeletonItem() {
  return (
    <div className="relative flex gap-4 pl-12 animate-pulse">
      <div className="absolute left-4.5 top-4 h-2.5 w-2.5 rounded-full bg-secondary-200 border-2 border-white" />
      <div className="flex-1 rounded-2xl border border-secondary-100 bg-white p-4 mb-3 space-y-2">
        <div className="h-4 w-40 rounded bg-secondary-100" />
        <div className="h-3 w-56 rounded bg-secondary-100" />
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const t = useTranslations("Pages.Activity");
  const tp = useTranslations("Pages");
  const locale = useLocale();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userId, setUserId] = useState("");
  const [applied, setApplied] = useState<ActivityFilters>({});
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  // ✅ Fix 1: hasFilters reflects applied state, not pending input state
  const hasFilters = Object.keys(applied).length > 0;

  function applyFilters() {
    setPage(1);
    setApplied({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      user: userId ? Number(userId) : undefined,
    });
  }

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setUserId("");
    setApplied({});
    setPage(1);
  }

  const activeFilters = Object.keys(applied).length > 0 ? applied : undefined;

  const { data, isLoading, isError, refetch } = useActivityFeed(page, PAGE_SIZE, activeFilters);
  const feed = data?.results ?? [];
  const count = data?.count ?? 0;
  const { data: notifs } = useNotifications();
  const { data: users } = useUsers({ page_size: 100 });

  const unread = notifs?.results?.filter((n: any) => !n.is_read).length ?? 0;

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={ScrollText}
        actions={
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5">
                <Bell size={13} className="text-primary-600" />
                <span className="text-xs font-semibold text-primary-700">
                  {unread} {t("unreadNotifications")}
                </span>
              </div>
            )}
            <span className="rounded-xl bg-secondary-100 px-3 py-1.5 text-xs font-semibold text-secondary-600">
              {tp("today")} — {new Date().toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </div>
        }
      />

      <div className="p-4 sm:p-8">
        {/* Filter bar */}
        <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-secondary-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <label htmlFor="activity-date-from" className="text-xs font-medium text-secondary-500">
              {t("from")}
            </label>
            <input
              id="activity-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="activity-date-to" className="text-xs font-medium text-secondary-500">
              {t("to")}
            </label>
            <input
              id="activity-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="activity-user" className="text-xs font-medium text-secondary-500">
              {t("userFilter")}
            </label>
            <select
              id="activity-user"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">{t("all")}</option>
              {(users ?? []).map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="flex items-center gap-1.5 rounded-xl bg-secondary-900 px-4 py-2 text-sm font-medium text-white hover:bg-secondary-800"
          >
            <Filter size={13} />
            {t("filter")}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-secondary-200 px-3 py-2 text-sm font-medium text-secondary-500 hover:border-secondary-300 hover:text-secondary-700"
            >
              <X size={13} />
              {t("reset")}
            </button>
          )}
        </div>

        {isError && <ErrorState onRetry={refetch} message={t("errorLoadingActivity")} className="mb-5" />}

        <div className="relative">
          <div className="absolute left-5.75 top-0 bottom-0 w-px bg-secondary-100" />

          <div className="space-y-1">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)
            ) : feed.length === 0 ? (
              <div className="py-16 text-center text-secondary-400">
                <ScrollText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("noActivityFound")}</p>
              </div>
            ) : (
              feed.map((ev) => {
                const meta = ACTION_META[ev.action ?? ""] ?? DEFAULT_META;
                const Icon = meta.icon;
                const date = new Date(ev.created_at);
                const timeStr = `${date.toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit" })} ${date.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}`;

                const fullName = ev.user_name || t("unknownUser");
                const initials = fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase();

                // Use backend-translated action label for the current locale
                const actionLabel = locale === "ar" ? (ev.action_ar ?? ev.action_fr ?? ev.action ?? "") : (ev.action_fr ?? ev.action ?? "");

                return (
                  <div key={ev.id} className="relative flex gap-4 pl-12">
                    <div className={`absolute left-4.5 top-4 h-2.5 w-2.5 rounded-full border-2 border-white ${meta.dot}`} />

                    <div className="flex-1 rounded-2xl border border-secondary-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md mb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-900 text-xs font-bold text-white">
                          {initials || "?"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-secondary-800 text-sm">{fullName}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.color}`}>
                              <Icon size={10} />
                              {actionLabel}
                            </span>
                          </div>
                          {/* ✅ Fix 2: Show description instead of repeating actionLabel */}
                          {ev.action && <p className="mt-1 text-sm text-secondary-700 font-medium">{ev.action}</p>}
                        </div>

                        <span className="shrink-0 text-xs text-secondary-400 tabular-nums">{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Pagination page={page} count={count} pageSize={PAGE_SIZE} onChange={setPage} className="mt-4" />
      </div>
    </div>
  );
}
