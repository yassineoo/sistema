"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserCog, UserPlus, KeyRound, Pencil, Trash2, ShieldCheck, Briefcase, PenTool, BookOpen, Layers } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useUsers } from "@/hooks/users";
import type { UserRole } from "@/types/schema";

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ElementType; classes: string }> = {
  directeur: { label: "Directeur", icon: ShieldCheck, classes: "bg-primary-100  text-primary-700" },
  secrétaire: { label: "Secrétaire", icon: Briefcase, classes: "bg-blue-100     text-blue-700" },
  opérateur: { label: "Opérateur", icon: Layers, classes: "bg-emerald-100  text-emerald-700" },
  infographe: { label: "Infographe", icon: PenTool, classes: "bg-purple-100   text-purple-700" },
  agent_polyvalent: { label: "Agent polyvalent", icon: BookOpen, classes: "bg-secondary-100 text-secondary-600" },
};

const ROLE_TABS = ["all", ...Object.keys(ROLE_CONFIG)] as const;
type RoleTab = (typeof ROLE_TABS)[number];

export default function UsersPage() {
  const t = useTranslations("Pages.Users");
  const tp = useTranslations("Pages");

  const [roleTab, setRoleTab] = useState<RoleTab>("all");

  const { data, isLoading, isError, refetch } = useUsers({
    role: roleTab !== "all" ? (roleTab as UserRole) : undefined,
    page_size: 50,
  });

  const users = data?.results ?? [];

  // For tab counts, load all to compute
  const { data: allData } = useUsers({ page_size: 50 });
  const allUsers = allData?.results ?? [];
  const counts: Record<string, number> = { all: allUsers.length };
  Object.keys(ROLE_CONFIG).forEach((r) => {
    counts[r] = allUsers.filter((u: any) => u.role === r).length;
  });

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={UserCog}
        actions={
          <button className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700">
            <UserPlus size={15} />
            {t("addUser")}
          </button>
        }
      />

      <div className="p-4 sm:p-8 space-y-5">
        {/* Role filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleTab(tab)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors
                ${
                  roleTab === tab
                    ? "bg-secondary-900 text-white shadow-sm"
                    : "border border-secondary-100 bg-white text-secondary-500 hover:border-secondary-300 hover:text-secondary-800"
                }`}
            >
              {tab === "all" ? "Tous" : ROLE_CONFIG[tab as UserRole].label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                ${roleTab === tab ? "bg-white/20 text-white" : "bg-secondary-100 text-secondary-500"}`}
              >
                {counts[tab] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {isError && <ErrorState onRetry={refetch} message="Impossible de charger les utilisateurs." />}

        {/* Table */}
        {!isError && (
          <div className="overflow-x-auto rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <table className="min-w-150 w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("name")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("email")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("role")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{tp("status")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("lastLogin")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400" />
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {isLoading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : users.length === 0 ? (
                  <EmptyState icon={UserCog} label="Aucun utilisateur trouvé" colSpan={6} />
                ) : (
                  users.map((u: any) => {
                    const role = ROLE_CONFIG[u.role as UserRole];
                    const RoleIcon = role.icon;
                    return (
                      <tr key={u.id} className="group transition-colors hover:bg-secondary-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-secondary-700 to-secondary-900 text-xs font-bold text-white">
                              {u.first_name[0]}
                              {u.last_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-secondary-800">
                                {u.first_name} {u.last_name}
                              </p>
                              <p className="text-[11px] text-secondary-400">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-secondary-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${role.classes}`}>
                            <RoleIcon size={11} />
                            {role.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold
                          ${u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-secondary-100 text-secondary-500"}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-secondary-400"}`} />
                            {u.is_active ? tp("active") : tp("inactive")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary-400 tabular-nums text-xs">{formatDate(u.last_login)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
                              title={tp("edit")}
                            >
                              <Pencil size={14} />
                            </button>
                            <button className="rounded-lg p-1.5 text-secondary-400 hover:bg-amber-50 hover:text-amber-600" title={t("resetPassword")}>
                              <KeyRound size={14} />
                            </button>
                            <button className="rounded-lg p-1.5 text-secondary-400 hover:bg-red-50 hover:text-red-500" title={tp("delete")}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Role legend */}
        {!isLoading && !isError && (
          <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-secondary-700">Rôles disponibles</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(ROLE_CONFIG) as [UserRole, (typeof ROLE_CONFIG)[UserRole]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={key} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${cfg.classes}`}>
                    <Icon size={12} />
                    {cfg.label}
                    <span className="ml-1 opacity-60">({counts[key] ?? 0})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
