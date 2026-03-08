"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  X, ClipboardList, User, Calendar, FileText,
  Clock, CheckCircle2, AlertCircle as AlertCircleIcon,
  RefreshCw, Loader2, Zap, ImagePlus, Trash2, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCommande, useUploadCommandeImages, useDeleteCommandeImage, useDeleteCommande } from "@/hooks/commandes";
import type { CommandeDetail, CommandeImage, CommandeStatus, Versement } from "@/types/schema";

const STATUS_ICON: Record<CommandeStatus, React.ElementType> = {
  en_attente:             Clock,
  en_cours_de_traitement: Loader2,
  terminée:               CheckCircle2,
  revision_requise:       AlertCircleIcon,
  en_cours_de_revision:   RefreshCw,
};

const STATUS_CLASSES: Record<CommandeStatus, string> = {
  en_attente:             "bg-amber-100   text-amber-700",
  en_cours_de_traitement: "bg-blue-100    text-blue-700",
  terminée:               "bg-emerald-100 text-emerald-700",
  revision_requise:       "bg-orange-100  text-orange-700",
  en_cours_de_revision:   "bg-purple-100  text-purple-700",
};

interface OrderDetailModalProps {
  orderId: number | null;
  onClose: () => void;
}

/** Algerian format: strip leading 0, prepend 213 */
function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? "213" + digits.slice(1) : digits;
  return `https://wa.me/${normalized}`;
}

function bonDeCommandeUrl(id: number) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${base}/commandes/${id}/bon_de_commande/`;
}

function formatMoney(val: string | number | undefined): string {
  const n = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  if (isNaN(n)) return "—";
  return `${n.toLocaleString("fr-DZ")} DA`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-DZ", {
    day: "2-digit", month: "2-digit", year: "2-digit",
  });
}

function ImagesSection({ order }: { order: CommandeDetail }) {
  const td = useTranslations("Pages.OrderDetail");
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadCommandeImages(order.id);
  const remove = useDeleteCommandeImage(order.id);

  const images: CommandeImage[] = order.images ?? [];

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    upload.mutate(files);
    e.target.value = "";
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary-400">
          <ImagePlus size={12} /> {td("images")} ({images.length})
        </h3>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center gap-1 rounded-lg border border-secondary-200 bg-white px-2.5 py-1 text-xs font-medium text-secondary-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
        >
          {upload.isPending ? <Loader2 size={11} className="animate-spin" /> : <ImagePlus size={11} />}
          {td("add")}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-secondary-200 py-6 text-sm text-secondary-400 transition-colors hover:border-primary-300 hover:text-primary-600"
        >
          <ImagePlus size={16} /> {td("addImages")}
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-secondary-100 bg-secondary-50">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove.mutate(img.id)}
                disabled={remove.isPending}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const td = useTranslations("Pages.OrderDetail");
  const ts = useTranslations("Pages.Statuses");

  const { data, isLoading } = useCommande(orderId ?? 0);
  const deleteCmd = useDeleteCommande();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (orderId === null) return null;

  const order = data as CommandeDetail | undefined;
  const StatusIcon = order ? (STATUS_ICON[order.status] ?? Clock) : Clock;
  const statusClasses = order ? (STATUS_CLASSES[order.status] ?? "") : "";

  const prixTotal    = order ? (parseFloat(order.prix_total) || 0) : 0;
  const montantVerse = order ? (parseFloat(order.montant_verse) || 0) : 0;

  const versements: Versement[] = order?.versements ?? [];
  const sumVersements = versements.reduce((s, v) => s + (typeof v.amount === "string" ? parseFloat(v.amount) : v.amount), 0);
  const reste = versements.length > 0
    ? prixTotal - montantVerse - sumVersements
    : (order ? (parseFloat(order.reste) || 0) : 0);
  const totalPaid = prixTotal - reste;
  const paidPct = prixTotal > 0 ? Math.min(100, (totalPaid / prixTotal) * 100) : 0;

  const phone = order?.client?.phone ?? "";
  const canDelete = order?.status === "en_attente";

  async function handleDelete() {
    if (!order) return;
    await deleteCmd.mutateAsync(order.id, {
      onSuccess: () => {
        toast.success(td("deleteSuccess"));
        onClose();
      },
      onError: () => {
        toast.error(td("deleteError"));
        setConfirmingDelete(false);
      },
    });
  }

  return (
    <>
      <div className="backdrop-animate fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-lg panel-animate">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="font-bold text-secondary-900">
                {isLoading ? td("loading") : order ? `${td("orderRef")}${order.id}` : ""}
              </h2>
              <p className="text-xs text-secondary-400">{td("title")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 rounded-2xl bg-secondary-100" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-secondary-100" />
              ))}
            </div>
          ) : !order ? (
            <p className="py-10 text-center text-sm text-secondary-400">{td("notFound")}</p>
          ) : (
            <>
              {/* Client + Status */}
              <div className="rounded-2xl border border-secondary-100 bg-secondary-50 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-900 text-sm font-bold text-white">
                      {order.client?.first_name?.[0]}{order.client?.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-secondary-900 truncate">
                        {order.client?.first_name} {order.client?.last_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-secondary-400 truncate">{phone}</p>
                        {phone && (
                          <a
                            href={whatsappUrl(phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={td("contactWhatsApp")}
                            className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 transition-colors hover:bg-green-200"
                          >
                            <MessageCircle size={10} />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                      <StatusIcon size={11} />{ts(order.status)}
                    </span>
                    {order.is_urgent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                        <Zap size={10} />URGENT
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary-500 pt-2 border-t border-secondary-200">
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    <span>{td("createdBy")} <span className="font-medium text-secondary-700">{order.created_by_name}</span></span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{td("deadline")} : <span className="font-medium text-secondary-700">{formatDate(order.delai)}</span></span>
                  </span>
                </div>
              </div>

              {/* Description */}
              {order.description && (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary-400">
                    <FileText size={12} /> Description
                  </h3>
                  <div className="rounded-xl border border-secondary-100 bg-white px-4 py-3 text-sm text-secondary-700 leading-relaxed">
                    {order.description}
                  </div>
                </section>
              )}

              {/* Financial */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-secondary-400">
                  {td("financial")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-secondary-100 bg-white px-4 py-3">
                    <span className="text-sm text-secondary-500">{td("totalPrice")}</span>
                    <span className="text-sm font-bold text-secondary-900">{formatMoney(order.prix_total)}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-secondary-100 bg-white px-4 py-3">
                    <span className="text-sm text-secondary-500">{td("initialDeposit")}</span>
                    <span className="text-sm font-semibold text-emerald-700">{formatMoney(order.montant_verse)}</span>
                  </div>

                  {versements.length > 0 && (
                    <div className="rounded-xl border border-secondary-100 bg-white overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-secondary-50">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary-400">
                          {td("installments")} ({versements.length})
                        </span>
                      </div>
                      {versements.map((v, i) => (
                        <div
                          key={v.id}
                          className={`flex items-center justify-between px-4 py-2.5 text-sm ${i < versements.length - 1 ? "border-b border-secondary-50" : ""}`}
                        >
                          <span className="text-secondary-500 tabular-nums">
                            {new Date(v.date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                          </span>
                          <span className="font-semibold text-emerald-700 tabular-nums">{formatMoney(v.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${reste > 0 ? "border-amber-100 bg-amber-50" : "border-emerald-100 bg-emerald-50"}`}>
                    <span className={`text-sm font-semibold ${reste > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                      {td("remainingToPay")}
                    </span>
                    <span className={`text-sm font-bold ${reste > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                      {formatMoney(reste)}
                    </span>
                  </div>
                </div>

                {/* Payment bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-secondary-400 mb-1.5">
                    <span>{td("payment")}</span>
                    <span className="font-medium">{Math.round(paidPct)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${paidPct >= 100 ? "bg-emerald-500" : "bg-primary-500"}`}
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* Assignee */}
              {order.pris_en_charge_par_name && (
                <div className="flex items-center gap-2 rounded-xl border border-secondary-100 bg-white px-4 py-3 text-sm text-secondary-600">
                  <User size={14} className="shrink-0 text-secondary-400" />
                  <span>
                    {td("assignedTo")} :{" "}
                    <span className="font-medium text-secondary-800">
                      {order.pris_en_charge_par_name}
                    </span>
                  </span>
                </div>
              )}

              {/* Images */}
              <ImagesSection order={order} />

              {/* Delete — only for en_attente */}
              {canDelete && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  {confirmingDelete ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-red-800">{td("confirmDeleteTitle")}</p>
                      <p className="text-xs text-red-600">{td("confirmDeleteMessage")}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(false)}
                          disabled={deleteCmd.isPending}
                          className="flex-1 rounded-lg border border-secondary-200 bg-white py-2 text-xs font-medium text-secondary-600 transition-colors hover:bg-secondary-50 disabled:opacity-60"
                        >
                          {td("cancel")}
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleteCmd.isPending}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          {deleteCmd.isPending ? (
                            <><Loader2 size={12} className="animate-spin" />{td("deleting")}</>
                          ) : (
                            <><Trash2 size={12} />{td("confirm")}</>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(true)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 size={12} />
                      {td("deleteOrder")}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-secondary-100 bg-secondary-50 px-6 py-4">
          {order && (
            <>
              {phone && (
                <a
                  href={whatsappUrl(phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              )}
              <a
                href={bonDeCommandeUrl(order.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <FileText size={14} />
                {td("bonDeCommande")}
              </a>
            </>
          )}
          <button
            onClick={onClose}
            className={`cursor-pointer rounded-xl border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100 ${order ? "flex-1" : "w-full"}`}
          >
            {td("close")}
          </button>
        </div>
      </aside>
    </>
  );
}
