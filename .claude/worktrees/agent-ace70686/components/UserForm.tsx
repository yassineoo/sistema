"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  ShieldCheck,
  FileText,
  Wrench,
  Pen,
  Layers,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import type { User as UserType, UserRole } from "@/types/schema";

export interface UserFormValues {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  password?: string;
  is_active: boolean;
}

interface UserFormProps {
  initialValues?: Partial<UserType>;
  mode: "create" | "edit";
  onSubmit: (values: UserFormValues) => void;
  isSubmitting?: boolean;
  showPasswordField?: boolean;
}

const ROLE_OPTIONS: {
  value: UserRole;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { value: "directeur",       label: "Directeur",        icon: ShieldCheck, description: "Accès complet au système" },
  { value: "secrétaire",      label: "Secrétaire",       icon: FileText,    description: "Gestion des commandes"   },
  { value: "opérateur",       label: "Opérateur",        icon: Wrench,      description: "Saisie et traitement"    },
  { value: "infographe",      label: "Infographe",       icon: Pen,         description: "Conception graphique"    },
  { value: "agent_polyvalent",label: "Agent polyvalent", icon: Layers,      description: "Rôle multi-tâches"       },
];

export default function UserForm({
  initialValues,
  mode,
  onSubmit,
  isSubmitting,
  showPasswordField = true,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      first_name: initialValues?.first_name ?? "",
      last_name:  initialValues?.last_name  ?? "",
      email:      initialValues?.email      ?? "",
      role:       (initialValues?.role as UserRole) ?? "opérateur",
      is_active:  initialValues?.is_active  ?? true,
    },
  });

  const watchRole   = watch("role");
  const watchActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Name row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
            Prénom <span className="text-primary-600">*</span>
          </label>
          <div className="relative">
            <User size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Ahmed"
              className="w-full rounded-xl border border-secondary-200 bg-white pl-8 pr-3 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("first_name", { required: "Obligatoire" })}
            />
          </div>
          {errors.first_name && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={11} />{errors.first_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
            Nom <span className="text-primary-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Benali"
            className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            {...register("last_name", { required: "Obligatoire" })}
          />
          {errors.last_name && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={11} />{errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Email ── */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
          E-mail <span className="text-primary-600">*</span>
        </label>
        <div className="relative">
          <Mail size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            type="email"
            placeholder="ahmed@exemple.com"
            className="w-full rounded-xl border border-secondary-200 bg-white pl-8 pr-3 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            {...register("email", {
              required: "Obligatoire",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail invalide" },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={11} />{errors.email.message}
          </p>
        )}
      </div>

      {/* ── Role ── */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
          Rôle <span className="text-primary-600">*</span>
        </label>
        {/* Hidden select for react-hook-form */}
        <select className="sr-only" {...register("role", { required: true })} tabIndex={-1}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <div className="space-y-2">
          {ROLE_OPTIONS.map(({ value, label, icon: Icon, description }) => {
            const isSelected = watchRole === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setValue("role", value, { shouldValidate: true })}
                className={`cursor-pointer flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isSelected
                    ? "border-primary-300 bg-primary-50 ring-2 ring-primary-100"
                    : "border-secondary-200 bg-white hover:border-secondary-300 hover:bg-secondary-50"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? "bg-primary-100 text-primary-600" : "bg-secondary-100 text-secondary-500"
                }`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isSelected ? "text-primary-700" : "text-secondary-800"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-secondary-400">{description}</p>
                </div>
                {isSelected && <Check size={14} className="shrink-0 text-primary-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active toggle ── */}
      <div className="flex items-center justify-between rounded-xl border border-secondary-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium text-secondary-800">Compte actif</p>
          <p className="text-xs text-secondary-400">L&apos;utilisateur peut se connecter</p>
        </div>
        <button
          type="button"
          onClick={() => setValue("is_active", !watchActive)}
          className={`cursor-pointer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            watchActive ? "bg-emerald-500" : "bg-secondary-200"
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            watchActive ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
      </div>

      {/* ── Password (create only) ── */}
      {mode === "create" && showPasswordField && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
            Mot de passe <span className="text-primary-600">*</span>
          </label>
          <div className="relative">
            <Lock size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-xl border border-secondary-200 bg-white pl-8 pr-10 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("password", {
                required: "Obligatoire",
                minLength: { value: 8, message: "Minimum 8 caractères" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={11} />{errors.password.message}
            </p>
          )}
          <p className="mt-1 text-xs text-secondary-400">Minimum 8 caractères.</p>
        </div>
      )}

      {/* ── Submit ── */}
      <div className="border-t border-secondary-100 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Check size={15} />
          )}
          {mode === "create" ? "Créer l'utilisateur" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
