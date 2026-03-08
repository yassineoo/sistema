"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  ClipboardList,
  Plus,
  LayoutGrid,
  LayoutList,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
  Zap,
  MessageCircle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import OrderModal, { type OrderFormData } from "@/components/OrderModal";
import StatusConfirmModal from "@/components/StatusConfirmModal";
import OrderDetailModal from "@/components/OrderDetailModal";
import { useCommandes, useCreateCommande, useUpdateCommandeStatus } from "@/hooks/commandes";
import type { CommandeStatus, CommandeListItem } from "@/types/schema";

// ── Status config (icons/classes only — labels come from translations) ────────
const STATUS_ICON: Record<CommandeStatus, React.ElementType> = {
  en_attente: Clock,
  en_cours_de_traitement: Loader2,
  terminée: CheckCircle2,
  revision_requise: AlertCircle,
  en_cours_de_revision: RefreshCw,
};

const STATUS_CLASSES: Record<CommandeStatus, string> = {
  en_attente: "bg-amber-100   text-amber-700",
  en_cours_de_traitement: "bg-blue-100    text-blue-700",
  terminée: "bg-emerald-100 text-emerald-700",
  revision_requise: "bg-orange-100  text-orange-700",
  en_cours_de_revision: "bg-purple-100  text-purple-700",
};

// ── Allowed status transitions ────────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<CommandeStatus, CommandeStatus[]> = {
  en_attente:             ["en_cours_de_traitement", "revision_requise", "en_cours_de_revision"],
  en_cours_de_traitement: ["terminée", "revision_requise"],
  revision_requise:       ["en_cours_de_revision", "terminée"],
  en_cours_de_revision:   ["terminée"],
  terminée:               [],
};

const STATUS_TABS = ["all", ...Object.keys(STATUS_ICON)] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const PAGE_SIZE = 10;

// ── Bon de commande URL helper ───────────────────────────────────────────────
function bonDeCommandeUrl(id: number) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${base}/commandes/${id}/bon_de_commande/`;
}

interface PendingStatusChange {
  orderId: number;
  currentStatus: CommandeStatus;
  newStatus: CommandeStatus;
}

// ── Status dropdown (fixed positioning to escape overflow-x-auto) ─────────────
function StatusDropdown({
  cmd,
  onRequestChange,
  isPending,
}: {
  cmd: CommandeListItem;
  onRequestChange: (cmd: CommandeListItem, newStatus: CommandeStatus) => void;
  isPending: boolean;
}) {
  const ts = useTranslations("Pages.Statuses");
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const StatusIcon = STATUS_ICON[cmd.status];
  const allowedNext = ALLOWED_TRANSITIONS[cmd.status];
  const canChange = allowedNext.length > 0 && !isPending;

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function handleMouseEnter() {
    if (!canChange) return;
    cancelClose();
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 220) {
        setDropdownPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
      } else {
        setDropdownPos({ top: rect.bottom + 4, left: rect.left });
      }
    }
    setOpen(true);
  }

  function handleMouseLeave() {
    scheduleClose();
  }

  return (
    <div ref={wrapperRef} className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[cmd.status]} ${canChange ? "cursor-pointer" : "cursor-default"} ${isPending ? "opacity-50" : ""}`}
      >
        <StatusIcon size={11} />
        {ts(cmd.status)}
      </button>

      {open && canChange && (
        <div
          style={dropdownPos}
          className="fixed z-[9999] w-48 rounded-xl border border-secondary-100 bg-white p-1 shadow-lg"
          onMouseEnter={cancelClose}
          onMouseLeave={handleMouseLeave}
        >
          {allowedNext.map((key) => {
            const SI = STATUS_ICON[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onRequestChange(cmd, key);
                  setOpen(false);
                }}
                className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-secondary-600 transition-colors hover:bg-secondary-50"
              >
                <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${STATUS_CLASSES[key]}`}>
                  <SI size={9} />
                </span>
                {ts(key)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? "213" + digits.slice(1) : digits;
  return `https://wa.me/${normalized}`;
}
// ── Card actions dropdown ────────────────────────────────────────────────────
function CardActionsDropdown({ cmd, bonDeCommandeLabel }: { cmd: CommandeListItem; bonDeCommandeLabel: string }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function handleMouseEnter() {
    cancelClose();
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 120);
    }
    setOpen(true);
  }
  return (
    <div ref={wrapperRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={scheduleClose}>
      <button className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600">
        <MoreVertical size={14} />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 w-48 rounded-xl border border-secondary-100 bg-white p-1 shadow-lg ${openUp ? "bottom-full mb-1" : "top-full mt-1"}`}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <a
            href={bonDeCommandeUrl(cmd.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-secondary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            <FileText size={12} />
            {bonDeCommandeLabel}
          </a>
          {cmd.client_phone && (
            <a
              href={whatsappUrl(cmd.client_phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const t = useTranslations("Pages.Orders");
  const tp = useTranslations("Pages");
  const ts = useTranslations("Pages.Statuses");

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, refetch } = useCommandes(page, PAGE_SIZE, {
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const createCmd = useCreateCommande();
  const updateStatus = useUpdateCommandeStatus();

  const commandes = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  async function handleSubmit(form: OrderFormData) {
    const base = {
      description: form.description,
      prix_total: form.prix_total,
      montant_verse: form.montant_verse,
      delai: form.delai,
      status: form.status,
      is_urgent: form.is_urgent,
    };
    if (form.clientType === "new") {
      await createCmd.mutateAsync({
        ...base,
        isNew: true,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
      } as unknown);
    } else {
      if (!form.existingClientId) return;
      await createCmd.mutateAsync({ ...base, client_id: Number(form.existingClientId) } as unknown);
    }
    setModalOpen(false);
  }

  function handleRequestStatusChange(cmd: CommandeListItem, newStatus: CommandeStatus) {
    if (cmd.status === newStatus) return;
    setPendingStatus({ orderId: cmd.id, currentStatus: cmd.status, newStatus });
  }

  function handleConfirmStatusChange() {
    if (!pendingStatus) return;
    updateStatus.mutateAsync({ id: pendingStatus.orderId, status: pendingStatus.newStatus }, { onSettled: () => setPendingStatus(null) });
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "2-digit" });

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={ClipboardList}
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <Plus size={15} />
            {t("addOrder")}
          </button>
        }
      />

      <div className="p-4 sm:p-8 space-y-5">
        {isError && <ErrorState onRetry={refetch} message={t("errorLoading")} />}

        {/* Summary strip */}
        {!isLoading && data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: t("totalOrders"), value: totalCount, color: "text-secondary-900" },
              { label: ts("en_attente"), value: commandes.filter((c) => c.status === "en_attente").length, color: "text-amber-700" },
              { label: ts("terminée"), value: commandes.filter((c) => c.status === "terminée").length, color: "text-emerald-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-secondary-100 bg-white px-4 py-3 shadow-sm">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-secondary-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
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
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setStatusFilter(tab); setPage(1); }}
                className={`cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors
                  ${
                    statusFilter === tab
                      ? "bg-secondary-900 text-white shadow-sm"
                      : "border border-secondary-100 bg-white text-secondary-500 hover:border-secondary-300 hover:text-secondary-800"
                  }`}
              >
                {tab === "all" ? t("all") : ts(tab as CommandeStatus)}
              </button>
            ))}
          </div>

          <div className="flex rounded-xl border border-secondary-100 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`cursor-pointer rounded-lg p-1.5 transition-colors ${viewMode === "table" ? "bg-secondary-900 text-white" : "text-secondary-400 hover:text-secondary-700"}`}
            >
              <LayoutList size={15} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`cursor-pointer rounded-lg p-1.5 transition-colors ${viewMode === "card" ? "bg-secondary-900 text-white" : "text-secondary-400 hover:text-secondary-700"}`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {/* Table view */}
        {!isError && viewMode === "table" && (
          <div className="overflow-x-auto rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <table className="min-w-175 w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">#</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("client")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("deadline")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("createdBy")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{tp("status")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {isLoading ? (
                  <TableSkeleton rows={6} cols={6} />
                ) : commandes.length === 0 ? (
                  <EmptyState icon={ClipboardList} label={t("noOrdersFound")} colSpan={6} />
                ) : (
                  commandes.map((cmd) => (
                    <tr
                      key={cmd.id}
                      onClick={() => setDetailOrderId(cmd.id)}
                      className="group cursor-pointer transition-colors hover:bg-secondary-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="rounded bg-secondary-100 px-2 py-0.5 font-mono text-xs font-semibold text-secondary-500">#{cmd.id}</span>
                          {cmd.is_urgent && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-700">
                              <Zap size={8} />URGENT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-secondary-800">{cmd.client_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500 tabular-nums">{formatDate(cmd.delai)}</td>
                      <td className="px-6 py-4 text-sm text-secondary-500">{cmd.created_by_name}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown cmd={cmd} onRequestChange={handleRequestStatusChange} isPending={updateStatus.isPending} />
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <a
                            href={bonDeCommandeUrl(cmd.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t("bonDeCommande")}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-2.5 py-1.5 text-xs font-medium text-secondary-600 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <FileText size={12} />
                            {t("bonDeCommande")}
                          </a>
                          {cmd.client_phone && (
                            <a
                              href={whatsappUrl(cmd.client_phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp"
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-green-200 bg-white px-2.5 py-1.5 text-xs font-medium text-green-700 shadow-sm transition-colors hover:bg-green-50"
                            >
                              <MessageCircle size={12} />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Card view */}
        {!isError && viewMode === "card" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm space-y-3">
                  <div className="h-4 w-24 rounded bg-secondary-100" />
                  <div className="h-4 w-40 rounded bg-secondary-100" />
                  <div className="h-3 w-56 rounded bg-secondary-100" />
                </div>
              ))
            ) : commandes.length === 0 ? (
              <div className="col-span-full py-16 text-center text-secondary-400">
                <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("noOrdersFound")}</p>
              </div>
            ) : (
              commandes.map((cmd) => (
                  <div
                    key={cmd.id}
                    onClick={() => setDetailOrderId(cmd.id)}
                    className="cursor-pointer rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="rounded bg-secondary-100 px-2 py-0.5 font-mono text-xs font-semibold text-secondary-500">#{cmd.id}</span>
                        {cmd.is_urgent && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-700">
                            <Zap size={8} />URGENT
                          </span>
                        )}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <CardActionsDropdown cmd={cmd} bonDeCommandeLabel={t("bonDeCommande")} />
                      </div>
                    </div>
                    <p className="font-semibold text-secondary-900">{cmd.client_name}</p>
                    <p className="text-xs text-secondary-400 mb-3">{t("createdBy")} {cmd.created_by_name}</p>
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <StatusDropdown cmd={cmd} onRequestChange={handleRequestStatusChange} isPending={updateStatus.isPending} />
                      <span className="text-xs text-secondary-400">{formatDate(cmd.delai)}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-secondary-50 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={bonDeCommandeUrl(cmd.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-secondary-200 bg-secondary-50 py-2 text-xs font-medium text-secondary-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                      >
                        <FileText size={12} />
                        {t("bonDeCommande")}
                      </a>
                      {cmd.client_phone && (
                        <a
                          href={whatsappUrl(cmd.client_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                        >
                          <MessageCircle size={12} />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl border border-secondary-100 bg-white px-5 py-3 shadow-sm">
            <span className="text-sm text-secondary-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} sur {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors
                    ${page === i + 1 ? "bg-secondary-900 text-white" : "text-secondary-500 hover:bg-secondary-100"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
      <OrderDetailModal orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />

      {pendingStatus && (
        <StatusConfirmModal
          orderId={pendingStatus.orderId}
          currentStatus={pendingStatus.currentStatus}
          newStatus={pendingStatus.newStatus}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setPendingStatus(null)}
          isPending={updateStatus.isPending}
        />
      )}
    </div>
  );
}
