"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useTranslations } from "next-intl";
import { Wallet, ChevronDown, ChevronRight, Plus, Trash2, Check, X, BadgeCheck, Clock, Filter, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { useCommandes, useCreateVersement, useDeleteVersement } from "@/hooks/commandes";
import type { CommandeListItem, Versement } from "@/types/schema";

type FilterType = "all" | "verse" | "en_cours";

/** Safe coercion: string | number | null | undefined → number */
const toNum = (v: string | number | undefined | null) => Number(v ?? 0);

/** Compute true remaining = commande.reste − sum(versements) */
const computeReste = (cmd: CommandeListItem) => {
  const sumV = (cmd.versements ?? []).reduce((s, v) => s + toNum(v.amount), 0);
  return toNum(cmd.reste) - sumV;
};

// ══════════════════════════════════════════════════════════════════════════════
// AddVersementModal
// ══════════════════════════════════════════════════════════════════════════════
function AddVersementModal({ commandeId, reste, onClose }: { commandeId: number; reste: number; onClose: () => void }) {
  const t = useTranslations("Pages.Payments");
  const createVersement = useCreateVersement(commandeId);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Guard: fully paid — shouldn't normally reach here but just in case
  if (reste <= 0) {
    return (
      <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-secondary-100">
          <BadgeCheck size={36} className="mx-auto mb-3 text-emerald-500" />
          <p className="font-semibold text-secondary-900">{t("statusVerse")}</p>
          <p className="mt-1 text-sm text-secondary-400">{t("noPaymentsRecorded")}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-xl bg-secondary-100 px-5 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-200"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount || !date) return;
    createVersement.mutateAsync(
      { amount: Number(amount), date },
      {
        onSuccess: () => onClose(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
          setError(
            err?.response?.data?.amount?.[0] ?? err?.response?.data?.non_field_errors?.[0] ?? err?.response?.data?.detail ?? t("errorAddingPayment"),
          );
        },
      },
    );
  };

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-secondary-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary-50 p-1.5">
              <Plus size={16} className="text-primary-600" />
            </div>
            <h2 className="text-base font-semibold text-secondary-900">{t("addPayment")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cancel")}
            className="rounded-lg p-1 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Remaining balance chip */}
        <div className="mx-6 mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-700">
            {t("remaining")} <span className="text-base font-bold tabular-nums">{reste.toLocaleString("fr-DZ")}</span> {t("currency")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-secondary-700">{t("amountDA")}</label>
            <input
              type="number"
              min="1"
              max={reste}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-sm text-secondary-800 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-versement-date" className="text-sm font-medium text-secondary-700">
              {t("date")}
            </label>
            <input
              id="modal-versement-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-sm text-secondary-800 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-secondary-200 px-4 py-2.5 text-sm font-semibold text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={createVersement.isPending || !amount}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {createVersement.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t("adding")}
                </>
              ) : (
                <>
                  <Plus size={14} />
                  {t("add")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VersementsPanel  — versements come embedded in the commande, no extra fetch
// ══════════════════════════════════════════════════════════════════════════════
function VersementsPanel({
  commandeId,
  prixTotal,
  commandeReste,
  versements,
}: {
  commandeId: number;
  prixTotal: number;
  /** commande.reste from API = prix_total − montant_verse */
  commandeReste: number;
  versements: Versement[];
}) {
  const t = useTranslations("Pages.Payments");
  const createVersement = useCreateVersement(commandeId);
  const deleteVersement = useDeleteVersement();

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // True remaining = commande.reste − sum(all versements)
  const sumVersements = versements.reduce((s, v) => s + toNum(v.amount), 0);
  const reste = commandeReste - sumVersements;
  const totalVerse = prixTotal - reste;
  const progressPct = prixTotal > 0 ? Math.min((totalVerse / prixTotal) * 100, 100) : 0;
  const isFullyPaid = reste <= 0;
  const isMutating = createVersement.isPending || deleteVersement.isPending;

  return (
    <div className="border-t border-secondary-100 bg-secondary-50/40">
      {showModal && <AddVersementModal commandeId={commandeId} reste={reste} onClose={() => setShowModal(false)} />}

      {/* ── Summary card ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-4 pb-3">
        <div className={`rounded-xl border border-secondary-100 bg-white px-5 py-3.5 shadow-sm transition-opacity ${isMutating ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Three amount pills */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex flex-col">
                <span className="mb-0.5 text-xs text-secondary-400">{t("totalPrice")}</span>
                <span className="font-semibold tabular-nums text-secondary-900">
                  {prixTotal.toLocaleString("fr-DZ")} {t("currency")}
                </span>
              </div>
              <div className="h-8 w-px bg-secondary-100" />
              <div className="flex flex-col">
                <span className="mb-0.5 text-xs text-secondary-400">{t("totalPaid")}</span>
                <span className="font-semibold tabular-nums text-emerald-700">
                  {totalVerse.toLocaleString("fr-DZ")} {t("currency")}
                </span>
              </div>
              <div className="h-8 w-px bg-secondary-100" />
              <div className="flex flex-col">
                <span className="mb-0.5 text-xs text-secondary-400">{t("remaining")}</span>
                <span className={`font-semibold tabular-nums ${isFullyPaid ? "text-emerald-700" : "text-amber-700"}`}>
                  {reste.toLocaleString("fr-DZ")} {t("currency")}
                </span>
              </div>
            </div>

            {/* Add button — hidden when fully paid */}
            {!isFullyPaid && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={isMutating}
                className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                {isMutating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {t("add")}
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isFullyPaid ? "bg-emerald-500" : "bg-primary-500"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1 text-end text-xs tabular-nums text-secondary-400">{progressPct.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* ── Versements list ─────────────────────────────────────────────────── */}
      <div className="px-6 pb-5">
        {versements.length === 0 ? (
          <p className="py-3 text-sm italic text-secondary-400">{t("noPaymentsRecorded")}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-secondary-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50">
                  <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("date")}</th>
                  <th className="px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("amount")}</th>
                  <th className="px-4 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-secondary-400">{t("action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {versements.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-secondary-50">
                    <td className="px-4 py-2.5 tabular-nums text-secondary-600">
                      {new Date(v.date).toLocaleDateString("fr-DZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums text-secondary-900">
                      {toNum(v.amount).toLocaleString("fr-DZ")} {t("currency")}
                    </td>
                    <td className="px-4 py-2.5 text-end">
                      {deleteConfirmId === v.id ? (
                        <span className="inline-flex items-center justify-end gap-1.5">
                          <span className="text-xs text-secondary-500">{t("confirm")}</span>
                          <button
                            type="button"
                            aria-label={t("confirmDelete")}
                            onClick={() => {
                              deleteVersement.mutateAsync(v.id);
                              setDeleteConfirmId(null);
                            }}
                            disabled={deleteVersement.isPending}
                            className="rounded-lg bg-red-100 p-1 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            aria-label={t("cancel")}
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg bg-secondary-100 p-1 text-secondary-600 transition-colors hover:bg-secondary-200"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-label={t("deletePayment")}
                          onClick={() => setDeleteConfirmId(v.id)}
                          disabled={isMutating}
                          className="rounded-lg p-1 text-secondary-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PaymentStatusBadge
// ══════════════════════════════════════════════════════════════════════════════
function PaymentStatusBadge({ reste }: { reste: number }) {
  const t = useTranslations("Pages.Payments");
  if (reste <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <BadgeCheck size={11} />
        {t("statusVerse")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      <Clock size={11} />
      {t("statusEnCours")}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PaymentsPage
// ══════════════════════════════════════════════════════════════════════════════
export default function PaymentsPage() {
  const t = useTranslations("Pages.Payments");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const { data, isLoading, isError, refetch } = useCommandes(1, 1000);
  const allCommandes = (data?.results ?? []) as CommandeListItem[];

  // Filter uses the computed reste (commande.reste − sum(versements))
  const commandes = allCommandes.filter((cmd) => {
    const reste = computeReste(cmd);
    if (filter === "verse") return reste <= 0;
    if (filter === "en_cours") return reste > 0;
    return true;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-DZ", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

  const tabCount = (key: FilterType) => {
    if (key === "all") return allCommandes.length;
    if (key === "verse") return allCommandes.filter((c) => computeReste(c) <= 0).length;
    /* en_cours */ return allCommandes.filter((c) => computeReste(c) > 0).length;
  };

  const filterTabs: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: t("filterAll"), icon: <Filter size={13} /> },
    { key: "en_cours", label: t("filterEnCours"), icon: <Clock size={13} /> },
    { key: "verse", label: t("filterVerse"), icon: <BadgeCheck size={13} /> },
  ];

  return (
    <div className="flex min-h-full flex-col bg-accent">
      <PageHeader title={t("title")} subtitle={t("subtitle")} icon={Wallet} />

      <div className="space-y-5 p-4 sm:p-8">
        {isError && <ErrorState onRetry={refetch} message={t("errorLoadingOrders")} />}

        {!isError && (
          <>
            {/* ── Filter tabs ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setFilter(tab.key);
                    setExpandedId(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    filter === tab.key
                      ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                      : "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300 hover:bg-secondary-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {!isLoading && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                        filter === tab.key ? "bg-white/20 text-white" : "bg-secondary-100 text-secondary-500"
                      }`}
                    >
                      {tabCount(tab.key)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Table ────────────────────────────────────────────────────── */}
            <div className="overflow-x-auto rounded-2xl border border-secondary-100 bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-secondary-100 bg-secondary-50">
                    <th className="w-10 px-4 py-3.5" aria-label={t("expand")} />
                    <th className="px-6 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      {t("order")}
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      {t("client")}
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      {t("status")}
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      {t("amount")}
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      {t("paymentStatus")}
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      {t("remaining")}
                    </th>
                    <th className="px-6 py-3.5 text-start text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      {t("deadline")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <TableSkeleton rows={6} cols={7} />
                  ) : commandes.length === 0 ? (
                    <EmptyState icon={Wallet} label={t("noOrdersFound")} colSpan={7} />
                  ) : (
                    commandes.map((cmd) => {
                      const prixTotal = toNum(cmd.prix_total);
                      const reste = computeReste(cmd);
                      const isExpanded = expandedId === cmd.id;

                      return (
                        <Fragment key={cmd.id}>
                          {/* ── Data row ── */}
                          <tr
                            onClick={() => setExpandedId(isExpanded ? null : cmd.id)}
                            className="cursor-pointer border-b border-secondary-50 transition-colors hover:bg-secondary-50"
                          >
                            <td className="px-4 py-4 text-secondary-400">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} className="rtl:rotate-180" />}
                            </td>

                            <td className="px-6 py-4">
                              <span className="rounded bg-secondary-100 px-2 py-0.5 font-mono text-xs font-semibold text-secondary-500">
                                #{cmd.id}
                              </span>
                            </td>

                            <td className="px-6 py-4 font-medium text-secondary-800">{cmd.client_name}</td>

                            <td className="px-6 py-4">
                              <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
                                {cmd.status.replace(/_/g, " ")}
                              </span>
                            </td>


                          
                            <td className="px-6 py-4">
                              <span className={`font-semibold tabular-nums text-sm ${reste <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                                {cmd.prix_total.toLocaleString("fr-DZ")} {t("currency")}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <PaymentStatusBadge reste={reste} />
                            </td>

                            <td className="px-6 py-4">
                              <span className={`font-semibold tabular-nums text-sm ${reste <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                                {reste.toLocaleString("fr-DZ")} {t("currency")}
                              </span>
                            </td>

                            <td className="px-6 py-4 tabular-nums text-secondary-500">{formatDate(cmd.delai)}</td>
                          </tr>

                          {/* ── Expansion panel ── */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="p-0">
                                <VersementsPanel
                                  commandeId={cmd.id}
                                  prixTotal={prixTotal}
                                  commandeReste={toNum(cmd.reste)}
                                  versements={cmd.versements ?? []}
                                />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
