"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X, Users, User, Briefcase, Building2, Phone, Mail, MapPin, Calendar, Tag } from "lucide-react";
import type { Client, ClientType } from "@/types/schema";

// ── Exported types ───────────────────────────────────────────────────────────
export interface ClientFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  adresse: string;
  secteur_activite: string;
  type: ClientType;
  delai: string; // ISO date string or ""
}

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  initialData?: Client | null; // null/undefined → create mode
  isLoading?: boolean;
}

// ── Type options ─────────────────────────────────────────────────────────────
const TYPE_OPTIONS: { key: ClientType; labelKey: "typeNormal" | "typeSousTraitant" | "typeDirection"; icon: React.ElementType; color: string }[] = [
  { key: "normal", labelKey: "typeNormal", icon: User, color: "text-blue-700   bg-blue-50   ring-blue-200" },
  { key: "sous_traitant", labelKey: "typeSousTraitant", icon: Briefcase, color: "text-purple-700 bg-purple-50 ring-purple-200" },
  { key: "direction", labelKey: "typeDirection", icon: Building2, color: "text-primary-700 bg-primary-50 ring-primary-200" },
];

// ── Small helpers ─────────────────────────────────────────────────────────────
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

const DEFAULT_FORM: ClientFormData = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  adresse: "",
  secteur_activite: "",
  type: "normal",
  delai: "",
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientModal({ open, onClose, onSubmit, initialData, isLoading }: ClientModalProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Pages.ClientModal");
  const isEdit = !!initialData;

  const [form, setForm] = useState<ClientFormData>(DEFAULT_FORM);

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          first_name: initialData.first_name,
          last_name: initialData.last_name,
          phone: initialData.phone,
          email: initialData.email ?? "",
          adresse: initialData.adresse ?? "",
          secteur_activite: initialData.secteur_activite ?? "",
          type: initialData.type,
          delai: initialData.delai || "", // Convert null to empty string for date input
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const set = <K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

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
              <Users size={18} />
            </div>
            <div>
              <h2 className="font-bold text-secondary-900">{isEdit ? t("editTitle") : t("createTitle")}</h2>
              {isEdit && (
                <p className="text-xs text-secondary-400">
                  {initialData!.first_name} {initialData!.last_name}
                </p>
              )}
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
            {/* ── Identity ── */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary-700">
                <User size={14} className="text-primary-600" /> {t("identitySection")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>{t("firstName")}</Label>
                  <InputBase value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder={t("firstNamePlaceholder")} required />
                </div>
                <div>
                  <Label required>{t("lastName")}</Label>
                  <InputBase value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder={t("lastNamePlaceholder")} required />
                </div>
              </div>
            </section>

            <div className="h-px bg-secondary-100" />

            {/* ── Contact ── */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary-700">
                <Phone size={14} className="text-primary-600" /> {t("contactSection")}
              </h3>
              <div className="space-y-3">
                <div>
                  <Label required>{t("phone")}</Label>
                  <InputBase type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("phonePlaceholder")} required />
                </div>
                <div>
                  <Label>
                    <span className="inline-flex items-center gap-1">
                      <Mail size={10} /> {t("emailLabel")}
                    </span>
                  </Label>
                  <InputBase type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={t("emailPlaceholder")} />
                </div>
                <div>
                  <Label>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} /> {t("addressLabel")}
                    </span>
                  </Label>
                  <InputBase value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder={t("addressPlaceholder")} />
                </div>
              </div>
            </section>

            <div className="h-px bg-secondary-100" />

            {/* ── Type & Sector ── */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary-700">
                <Tag size={14} className="text-primary-600" /> {t("typeSectorSection")}
              </h3>

              {/* Type selector */}
              <div className="mb-4">
                <Label required>{t("clientTypeLabel")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map(({ key, labelKey, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("type", key)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-all
                        ${
                          form.type === key
                            ? `border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-200`
                            : "border-secondary-200 bg-white text-secondary-500 hover:border-secondary-300"
                        }`}
                    >
                      <Icon size={16} className={form.type === key ? "text-primary-600" : "text-secondary-400"} />
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sector */}
              <div>
                <Label>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase size={10} /> {t("sectorLabel")}
                  </span>
                </Label>
                <InputBase
                  value={form.secteur_activite}
                  onChange={(e) => set("secteur_activite", e.target.value)}
                  placeholder={t("sectorPlaceholder")}
                />
              </div>
            </section>

            <div className="h-px bg-secondary-100" />

            {/* ── Deadline ── */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary-700">
                <Calendar size={14} className="text-primary-600" /> {t("deadlineSection")}
              </h3>
              <div>
                <Label>{t("deadlineLabel")}</Label>
                <InputBase type="number" value={form.delai} onChange={(e) => set("delai", e.target.value)} />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-secondary-100 bg-secondary-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-secondary-200 bg-white px-5 py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {isLoading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
              {isEdit ? t("save") : t("create")}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
