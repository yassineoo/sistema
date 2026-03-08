"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Users as UsersIcon, UserPlus, ShieldAlert, Eye, Pencil, KeyRound, Power, Trash2, X, Mail, Calendar, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import UserFormModal from "@/components/UserFormModal";
import { useUsers, useDeleteUser, useActivateUser, useDeactivateUser } from "@/hooks/users";
import { useMyProfile } from "@/hooks/auth";
import type { User, UserRole } from "@/types/schema";

const ROLE_LABELS: Record<UserRole, string> = {
  directeur: "Directeur",
  secrétaire: "Secrétaire",
  opérateur: "Opérateur",
  infographe: "Infographe",
  agent_polyvalent: "Agent polyvalent",
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; ring: string; gradient: string }> = {
  directeur: { bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-200", gradient: "from-purple-500 to-purple-700" },
  secrétaire: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200", gradient: "from-blue-500 to-blue-700" },
  opérateur: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200", gradient: "from-emerald-500 to-emerald-700" },
  infographe: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200", gradient: "from-amber-500 to-amber-700" },
  agent_polyvalent: { bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-200", gradient: "from-rose-500 to-rose-700" },
};

export default function UsersPage() {
  const t = useTranslations("Pages.Users");
  const tp = useTranslations("Pages");
  const router = useRouter();

  const { data: me, isLoading: isLoadingMe } = useMyProfile();
  const { data: users, isLoading, isError, refetch } = useUsers({ page_size: 100 });

  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const canManageUsers = useMemo(() => me && me.role === "directeur", [me]);

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-DZ", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(null);
    router.push(`./users/${user.id}/change-password`);
  };

  const handleToggleActive = (user: User) => {
    const mutation = user.is_active ? deactivateUser : activateUser;
    mutation.mutateAsync(user.id, {
      onSuccess: () => {
        toast.success(user.is_active ? t("deactivated") : t("activated"));
        setSelectedUser(null);
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { error?: string } } };
        toast.error(err.response?.data?.error ?? t("cannotDelete"));
      },
    });
  };

  const handleDeleteUser = (user: User) => {
    deleteUser.mutateAsync(user.id, {
      onSuccess: () => {
        toast.success(t("userDeleted"));
        setSelectedUser(null);
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { error?: string } } };
        toast.error(err.response?.data?.error ?? t("cannotDelete"));
      },
    });
  };

  if (!isLoadingMe && !canManageUsers) {
    return (
      <div className="flex flex-col min-h-full bg-accent">
        <PageHeader title={t("title")} subtitle={t("subtitle")} icon={UsersIcon} />
        <div className="p-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 flex items-start gap-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">{t("restrictedAccess")}</p>
              <p>{t("restrictedMessage")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={UsersIcon}
        actions={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <UserPlus size={15} />
            {t("addUser")}
          </button>
        }
      />

      <div className="p-4 sm:p-8 space-y-5">
        {isError && <ErrorState onRetry={refetch} message={t("errorLoading")} />}

        {!isError && (
          <div className="overflow-x-auto rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <table className="min-w-150 w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("name")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("email")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("role")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{tp("status")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("registrationDate")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400" />
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {isLoading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : !users || users.length === 0 ? (
                  <EmptyState icon={UsersIcon} label={t("noUsersFound")} colSpan={6} />
                ) : (
                  users.map((u: any) => {
                    const roleColor = ROLE_COLORS[u?.role as UserRole];
                    return (
                      <tr key={u.id} onClick={() => setSelectedUser(u)} className="group cursor-pointer transition-colors hover:bg-secondary-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${roleColor?.gradient} text-xs font-bold text-white`}
                            >
                              {u.first_name[0]}
                              {u.last_name[0]}
                            </div>
                            <p className="font-medium text-secondary-800">
                              {u.first_name} {u.last_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-secondary-500">{u?.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${roleColor?.bg} ${roleColor?.text} ${roleColor?.ring}`}
                          >
                            {ROLE_LABELS[u.role as UserRole]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(u);
                            }}
                            disabled={activateUser.isPending || deactivateUser.isPending}
                            className={`cursor-pointer flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                              u?.is_active
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-secondary-100 text-secondary-500 hover:bg-secondary-200"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${u?.is_active ? "bg-emerald-500" : "bg-secondary-400"}`} />
                            {u?.is_active ? tp("active") : tp("inactive")}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-secondary-400 tabular-nums text-xs">{formatDate(u.date_joined ?? null)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(u);
                              }}
                              className="cursor-pointer rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
                              title={t("view")}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTarget(u);
                              }}
                              className="cursor-pointer rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
                              title={tp("edit")}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChangePassword(u);
                              }}
                              className="cursor-pointer rounded-lg p-1.5 text-secondary-400 hover:bg-amber-50 hover:text-amber-600"
                              title={t("changePasswordAction")}
                            >
                              <KeyRound size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(u);
                              }}
                              className="cursor-pointer rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
                              title={u?.is_active ? t("deactivate") : t("activate")}
                            >
                              <Power size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(u);
                              }}
                              className="cursor-pointer rounded-lg p-1.5 text-secondary-400 hover:bg-red-50 hover:text-red-500"
                              title={tp("delete")}
                            >
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
      </div>

      {/* ── User Detail Modal ── */}
      {selectedUser &&
        (() => {
          const roleColor = ROLE_COLORS[selectedUser.role];
          return (
            <>
              <div className="backdrop-animate fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="dropdown-animate w-full max-w-sm rounded-2xl border border-secondary-100 bg-white shadow-2xl overflow-hidden">
                  {/* Hero */}
                  <div className={`relative bg-linear-to-br ${roleColor?.gradient} px-6 pt-6 pb-10`}>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="cursor-pointer absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white ring-4 ring-white/30">
                        {selectedUser.first_name[0]}
                        {selectedUser.last_name[0]}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">
                          {selectedUser.first_name} {selectedUser.last_name}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-white">
                          <Shield size={10} />
                          {ROLE_LABELS[selectedUser.role]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-5 mx-4 rounded-2xl border border-secondary-100 bg-white px-4 py-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-500">{t("statusLabel")}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${selectedUser.is_active ? "bg-emerald-100 text-emerald-700" : "bg-secondary-100 text-secondary-500"}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedUser.is_active ? "bg-emerald-500" : "bg-secondary-400"}`} />
                        {selectedUser.is_active ? tp("active") : tp("inactive")}
                      </span>
                    </div>
                    <div className="h-px bg-secondary-100" />
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail size={14} className="shrink-0 text-secondary-400" />
                      <span className="truncate text-secondary-700">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <Calendar size={14} className="shrink-0 text-secondary-400" />
                      <span className="text-secondary-500">
                        {t("registeredOn")} <span className="font-medium text-secondary-700">{formatDate(selectedUser.date_joined ?? null)}</span>
                      </span>
                    </div>
                    {selectedUser.last_login && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Clock size={14} className="shrink-0 text-secondary-400" />
                        <span className="text-secondary-500">
                          {t("lastLoginLabel")} <span className="font-medium text-secondary-700">{formatDate(selectedUser.last_login)}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 px-4 pt-3 pb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setEditTarget(selectedUser);
                      }}
                      className="cursor-pointer flex flex-col items-center gap-1.5 rounded-xl border border-secondary-200 bg-white py-3 text-xs font-medium text-secondary-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                    >
                      <Pencil size={15} />
                      {t("modify")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePassword(selectedUser)}
                      className="cursor-pointer flex flex-col items-center gap-1.5 rounded-xl border border-secondary-200 bg-white py-3 text-xs font-medium text-secondary-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <KeyRound size={15} />
                      {t("password")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser)}
                      disabled={deleteUser.isPending}
                      className="cursor-pointer flex flex-col items-center gap-1.5 rounded-xl border border-secondary-200 bg-white py-3 text-xs font-medium text-secondary-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                    >
                      <Trash2 size={15} />
                      {t("deleteAction")}
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

      {/* ── Create modal ── */}
      <UserFormModal mode="create" open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

      {/* ── Edit modal ── */}
      <UserFormModal mode="edit" user={editTarget} open={editTarget !== null} onClose={() => setEditTarget(null)} />
    </div>
  );
}
