"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Users, UserPlus, Search, Briefcase, Building2, User, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ClientModal, { type ClientFormData } from "@/components/ClientModal";
import ClientDetailModal from "@/components/ClientDetailModal";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/clients";
import type { ClientType, Client } from "@/types/schema";

const TYPE_ICON: Record<ClientType, React.ElementType> = {
  normal: User,
  sous_traitant: Briefcase,
  direction: Building2,
};

const TYPE_CLASSES: Record<ClientType, string> = {
  normal:       "bg-blue-100    text-blue-700",
  sous_traitant:"bg-purple-100  text-purple-700",
  direction:    "bg-primary-100 text-primary-700",
};

const TYPE_TABS = ["all", ...Object.keys(TYPE_ICON)] as const;
type TypeTab = (typeof TYPE_TABS)[number];

export default function ClientsPage() {
  const t = useTranslations("Pages.Clients");

  const typeLabels: Record<ClientType, string> = {
    normal:       t("normalType"),
    sous_traitant:t("soustraitantType"),
    direction:    t("directionType"),
  };

  const [search, setSearch] = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeTab>("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  // Detail modal state
  const [detailClientId, setDetailClientId] = useState<number | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, refetch } = useClients({
    search: debSearch || undefined,
  });

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  // API returns Client[] — client-side type filtering
  const allClients = (data ?? []) as Client[];
  const clients = typeFilter === "all" ? allClients : allClients.filter((c) => c.type === typeFilter);

  const counts = {
    all: allClients.length,
    normal: allClients.filter((c) => c.type === "normal").length,
    sous_traitant: allClients.filter((c) => c.type === "sous_traitant").length,
    direction: allClients.filter((c) => c.type === "direction").length,
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleOpenCreate() {
    setEditClient(null);
    setModalOpen(true);
  }

  function handleOpenEdit(client: Client) {
    setEditClient(client);
    setModalOpen(true);
  }

  async function handleModalSubmit(form: ClientFormData) {
    const payload = {
      ...form,
      delai: form.delai || null,
    };

    if (editClient) {
      await updateClient.mutateAsync(
        { id: editClient.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("updateSuccess"));
            setModalOpen(false);
          },
          onError: () => toast.error(t("updateError")),
        },
      );
    } else {
      await createClient.mutateAsync(payload, {
        onSuccess: () => {
          toast.success(t("createSuccess"));
          setModalOpen(false);
        },
        onError: () => toast.error(t("createError")),
      });
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    await deleteClient.mutateAsync(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t("deleteSuccess"));
        setDeleteTarget(null);
      },
      onError: () => toast.error(t("deleteError")),
    });
  }

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Users}
        actions={
          <button
            onClick={handleOpenCreate}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <UserPlus size={15} />
            {t("addClient")}
          </button>
        }
      />

      <div className="p-4 sm:p-8 space-y-5">
        {isError && <ErrorState onRetry={refetch} message={t("errorLoading")} />}

        {/* Search + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-secondary-100 bg-white py-2 pl-8 pr-4 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`cursor-pointer flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors
                  ${
                    typeFilter === tab
                      ? "bg-secondary-900 text-white shadow-sm"
                      : "border border-secondary-100 bg-white text-secondary-500 hover:border-secondary-300 hover:text-secondary-800"
                  }`}
              >
                {tab === "all" ? t("typeAll") : typeLabels[tab as ClientType]}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                  ${typeFilter === tab ? "bg-white/20 text-white" : "bg-secondary-100 text-secondary-500"}`}
                >
                  {counts[tab as keyof typeof counts] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {!isError && (
          <div className="overflow-x-auto rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <table className="min-w-175 w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("name")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("contact")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("sector")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("type")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("deadline")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {isLoading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : clients.length === 0 ? (
                  <EmptyState icon={Users} label={t("noClientsFound")} colSpan={6} />
                ) : (
                  clients.map((c) => {
                    const TypeIcon = TYPE_ICON[c.type];
                    return (
                      <tr key={c.id} onClick={() => setDetailClientId(c.id)} className="group cursor-pointer transition-colors hover:bg-secondary-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-900 text-xs font-bold text-white">
                              {c.first_name[0]}
                              {c.last_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-secondary-800">
                                {c.first_name} {c.last_name}
                              </p>
                              <p className="text-[11px] text-secondary-400">{c.adresse}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-secondary-700">{c.phone}</p>
                          <p className="text-[11px] text-secondary-400">{c.email}</p>
                        </td>
                        <td className="px-6 py-4 text-secondary-500">{c.secteur_activite}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_CLASSES[c.type]}`}>
                            <TypeIcon size={11} />
                            {typeLabels[c.type]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-500 tabular-nums">{c.delai + "j"}</td>
                        {/* ── Actions column ── */}
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              title={t("editClient")}
                              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg border border-secondary-200 bg-white text-secondary-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              title={t("deleteClient")}
                              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg border border-secondary-200 bg-white text-secondary-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={13} />
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

        {/* Type legend */}
        {!isLoading && !isError && (
          <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-secondary-700">{t("clientTypesLegend")}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(TYPE_ICON) as [ClientType, React.ElementType][]).map(([key, Icon]) => (
                <div key={key} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${TYPE_CLASSES[key]}`}>
                  <Icon size={12} />
                  {typeLabels[key]}
                  <span className="ml-1 opacity-60">({counts[key] ?? 0})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Client Modal (Add / Edit) ── */}
      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editClient}
        isLoading={createClient.isPending || updateClient.isPending}
      />

      {/* ── Client Detail slide-over ── */}
      <ClientDetailModal clientId={detailClientId} onClose={() => setDetailClientId(null)} />

      {/* ── Delete confirmation dialog ── */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-secondary-100 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={22} />
              </div>
              <h3 className="mb-1 text-base font-bold text-secondary-900">{t("deleteClient")}</h3>
              <p className="mb-5 text-sm text-secondary-500">
                {t("confirmDelete")}{" "}
                <span className="font-semibold text-secondary-800">
                  {deleteTarget.first_name} {deleteTarget.last_name}
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="cursor-pointer flex-1 rounded-xl border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteClient.isPending}
                  className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteClient.isPending && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {t("deleteAction")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
