"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  X,
  User,
  UserPlus,
  Search,
  ChevronDown,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  Calendar,
  Zap,
} from "lucide-react";
import type { CommandeStatus, Client } from "@/types/schema";
import { useClients } from "@/hooks/clients";

// ── Exported types used by orders page ──────────────────────────────────────
export type { CommandeStatus as OrderStatus };

export interface OrderFormData {
  clientType: "existing" | "new";
  existingClientId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  orderType: string;
  description: string;
  prix_total: number;
  montant_verse: number;
  delai: string; // ISO date
  status: CommandeStatus;
  is_urgent: boolean;
}

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormData) => Promise<void>;
}

// ── Status options aligned with Django ──────────────────────────────────────
const STATUS_OPTIONS: {
  key: CommandeStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { key: "en_attente", label: "En attente", icon: Clock, color: "text-amber-700  bg-amber-50  ring-amber-200" },
  { key: "en_cours_de_traitement", label: "En cours", icon: Loader2, color: "text-blue-700   bg-blue-50   ring-blue-200" },
  { key: "terminée", label: "Terminée", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50 ring-emerald-200" },
  { key: "revision_requise", label: "Révision requise", icon: AlertCircle, color: "text-orange-700 bg-orange-50 ring-orange-200" },
  { key: "en_cours_de_revision", label: "En cours de révision", icon: RefreshCw, color: "text-purple-700 bg-purple-50 ring-purple-200" },
];

// ── Print shop order types ───────────────────────────────────────────────────
const ORDER_TYPES = [
  {
    group: "Impression papier",
    items: [
      "Cartes de visite",
      "Flyers & Tracts",
      "Affiches & Posters",
      "Brochures & Catalogues",
      "En-têtes & Papeterie",
      "Enveloppes",
      "Carnets & Blocs-notes",
      "Calendriers",
      "Invitations & Faire-part",
    ],
  },
  { group: "Grand format", items: ["Bâches & Banderoles", "Roll-up & Stand", "Enseignes & Signalétique", "Covering véhicule"] },
  {
    group: "Objets publicitaires",
    items: ["T-shirts & Textile", "Mugs & Goodies", "Stylos personnalisés", "Badges & Name tags", "Packaging & Boîtes"],
  },
  { group: "Impression spéciale", items: ["Tampons", "Autocollants & Stickers", "Cartes de fidélité", "Impression photo", "Toile & Canvas"] },
];

// ── Small helpers ───────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
      {children}
      {required && <span className="ml-0.5 text-primary-600">*</span>}
    </label>
  );
}

function InputBase({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-secondary-200 bg-white px-3.5 py-2.5 text-sm text-secondary-800
        outline-none transition-all placeholder:text-secondary-400
        focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${className}`}
    />
  );
}

const DEFAULT_FORM: OrderFormData = {
  clientType: "existing",
  existingClientId: "",
  firstName: "",
  lastName: "",
  phone: "",
  orderType: "",
  description: "",
  prix_total: 0,
  montant_verse: 0,
  delai: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  status: "en_attente",
  is_urgent: false,
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function OrderModal({ open, onClose, onSubmit }: OrderModalProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Pages.OrderModal");

  const [form, setForm] = useState<OrderFormData>(DEFAULT_FORM);
  const [clientSearch, setClientSearch] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [typeGroupOpen, setTypeGroupOpen] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch real clients from API
  const { data: clientsData } = useClients({ search: clientSearch || undefined });
  const clients = (clientsData ?? []) as Client[];

  useEffect(() => {
    if (!open) {
      setForm(DEFAULT_FORM);
      setClientSearch("");
      setClientOpen(false);
      setTypeGroupOpen(null);
      setIsSubmitting(false);
      setValidationError(null);
    }
  }, [open]);

  if (!open) return null;

  const filteredClients = clients.filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(clientSearch.toLowerCase()));
  const selectedClient = clients.find((c) => String(c.id) === form.existingClientId);

  function validate(): string | null {
    if (form.clientType === "existing" && !form.existingClientId)
      return t("validationSelectClient");
    if (form.clientType === "new") {
      if (!form.firstName?.trim()) return t("validationFirstName");
      if (!form.lastName?.trim())  return t("validationLastName");
      if (!form.phone?.trim())     return t("validationPhone");
    }
    if (form.prix_total <= 0) return t("validationPrice");
    if (form.montant_verse > form.prix_total) return t("validationDeposit");
    if (!form.delai) return t("validationDeadline");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const reste = form.prix_total - form.montant_verse;

  return (
    <>
      <div className="backdrop-animate fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <aside
        className={`fixed top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-xl
          ${isRTL ? "left-0 panel-animate-rtl" : "right-0 panel-animate"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="font-bold text-secondary-900">{t("title")}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* ── Client ── */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary-700">
                <User size={14} className="text-primary-600" /> Client
              </h3>

              <div className="mb-4 flex rounded-xl border border-secondary-200 p-1">
                {[
                  { value: "existing", label: t("existingClient"), icon: User },
                  { value: "new", label: t("newClient"), icon: UserPlus },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("clientType", value as "existing" | "new")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all
                      ${form.clientType === value ? "bg-secondary-900 text-white shadow-sm" : "text-secondary-500 hover:text-secondary-800"}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {form.clientType === "existing" ? (
                <div className="relative">
                  <Label required>{t("selectClientLabel")}</Label>
                  <button
                    type="button"
                    onClick={() => setClientOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-xl border border-secondary-200 bg-white px-3.5 py-2.5 text-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    {selectedClient ? (
                      <span className="font-medium text-secondary-800">
                        {selectedClient.first_name} {selectedClient.last_name}
                      </span>
                    ) : (
                      <span className="text-secondary-400">{t("selectClientPlaceholder")}</span>
                    )}
                    <ChevronDown size={15} className={`text-secondary-400 transition-transform ${clientOpen ? "rotate-180" : ""}`} />
                  </button>
                  {clientOpen && (
                    <div className="dropdown-animate absolute top-full z-10 mt-1 w-full overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-xl">
                      <div className="flex items-center gap-2 border-b border-secondary-100 px-3 py-2">
                        <Search size={13} className="text-secondary-400" />
                        <input
                          autoFocus
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          placeholder={t("searchClients")}
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-secondary-400"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {filteredClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              set("existingClientId", String(c.id));
                              setClientOpen(false);
                              setClientSearch("");
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-secondary-50
                              ${String(c.id) === form.existingClientId ? "bg-primary-50 text-primary-700 font-medium" : "text-secondary-700"}`}
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-900 text-[10px] font-bold text-white">
                              {c.first_name[0]}
                              {c.last_name[0]}
                            </div>
                            <div className="text-left">
                              <p className="font-medium">
                                {c.first_name} {c.last_name}
                              </p>
                              <p className="text-xs text-secondary-400">
                                {c.phone} · {c.secteur_activite}
                              </p>
                            </div>
                          </button>
                        ))}
                        {filteredClients.length === 0 && <p className="px-3 py-4 text-center text-xs text-secondary-400">{t("noClientsFound")}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label required>{t("firstName")}</Label>
                      <InputBase value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder={t("firstNamePlaceholder")} required />
                    </div>
                    <div>
                      <Label required>{t("lastName")}</Label>
                      <InputBase value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder={t("lastNamePlaceholder")} required />
                    </div>
                  </div>
                  <div>
                    <Label required>{t("phone")}</Label>
                    <InputBase type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("phonePlaceholder")} required />
                  </div>
                </div>
              )}
            </section>

            <div className="h-px bg-secondary-100" />

            {/* ── Type de commande ── */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary-700">
                <FileText size={14} className="text-primary-600" /> {t("orderTypeSection")}
              </h3>
              {form.orderType && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5">
                  <span className="text-sm font-medium text-primary-700">{form.orderType}</span>
                  <button type="button" onClick={() => set("orderType", "")} className="text-primary-400 hover:text-primary-700">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="overflow-hidden rounded-xl border border-secondary-200">
                {ORDER_TYPES.map(({ group, items }) => (
                  <div key={group} className="border-b border-secondary-100 last:border-0">
                    <button
                      type="button"
                      onClick={() => setTypeGroupOpen(typeGroupOpen === group ? null : group)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-secondary-700 hover:bg-secondary-50"
                    >
                      {group}
                      <ChevronDown size={14} className={`text-secondary-400 transition-transform ${typeGroupOpen === group ? "rotate-180" : ""}`} />
                    </button>
                    {typeGroupOpen === group && (
                      <div className="grid grid-cols-2 gap-1.5 px-3 pb-3">
                        {items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              set("orderType", item);
                              setTypeGroupOpen(null);
                            }}
                            className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors
                              ${form.orderType === item ? "bg-primary-600 text-white" : "bg-secondary-50 text-secondary-600 hover:bg-secondary-100"}`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-secondary-100" />

            {/* ── Description ── */}
            <section>
              <Label>{t("descriptionLabel")}</Label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder={t("descriptionPlaceholder")}
                className="w-full resize-none rounded-xl border border-secondary-200 bg-white px-3.5 py-2.5 text-sm text-secondary-800
                  outline-none transition-all placeholder:text-secondary-400
                  focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </section>

            <div className="h-px bg-secondary-100" />

            {/* ── Urgence ── */}
            <button
              type="button"
              onClick={() => set("is_urgent", !form.is_urgent)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                form.is_urgent
                  ? "border-red-300 bg-red-50"
                  : "border-secondary-200 bg-white hover:border-secondary-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${form.is_urgent ? "bg-red-100 text-red-600" : "bg-secondary-100 text-secondary-400"}`}>
                  <Zap size={15} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${form.is_urgent ? "text-red-700" : "text-secondary-700"}`}>
                    {t("urgent")}
                  </p>
                  <p className="text-xs text-secondary-400">{t("urgentDesc")}</p>
                </div>
              </div>
              <div className={`relative h-6 w-11 rounded-full transition-colors ${form.is_urgent ? "bg-red-500" : "bg-secondary-200"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.is_urgent ? "left-5.75" : "left-0.5"}`} />
              </div>
            </button>

            <div className="h-px bg-secondary-100" />

            {/* ── Financier & délai ── */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary-700">
                <DollarSign size={14} className="text-primary-600" /> {t("financialSection")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>{t("totalPriceLabel")}</Label>
                  <InputBase
                    type="number"
                    min={0}
                    value={form.prix_total || ""}
                    onChange={(e) => set("prix_total", Number(e.target.value))}
                    placeholder={t("totalPricePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <Label>{t("paidAmountLabel")}</Label>
                  <InputBase
                    type="number"
                    min={0}
                    max={form.prix_total}
                    value={form.montant_verse || ""}
                    onChange={(e) => set("montant_verse", Number(e.target.value))}
                    placeholder={t("paidAmountPlaceholder")}
                  />
                </div>
              </div>
              {form.prix_total > 0 && (
                <div
                  className={`mt-2 flex items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold
                  ${reste <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                >
                  <span>{t("remainingToPay")}</span>
                  <span>{Math.max(0, reste).toLocaleString("fr-DZ")} DZD</span>
                </div>
              )}
              <div className="mt-3">
                <Label required>
                  <Calendar size={11} className="inline mr-1" />
                  {t("deadlineLabel")}
                </Label>
                <InputBase type="date" value={form.delai} onChange={(e) => set("delai", e.target.value)} required />
              </div>
            </section>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="mx-6 mb-2 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle size={14} className="shrink-0" />
              {validationError}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-secondary-100 bg-secondary-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-secondary-200 bg-white px-5 py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? t("creating") : t("create")}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
