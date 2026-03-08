"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X, KeyRound, AlertCircle, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { useUpdateMyProfile } from "@/hooks/auth";

interface FormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const updateProfile = useUpdateMyProfile();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const newPwd = watch("new_password", "");
  const confirmPwd = watch("confirm_password", "");

  const strengthLevel = newPwd.length === 0 ? 0 : newPwd.length < 8 ? 1 : newPwd.length < 12 ? 2 : 3;
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400"][strengthLevel];
  const strengthLabel = ["", "Trop court", "Acceptable", "Solide"][strengthLevel];
  const strengthTextColor = ["", "text-red-500", "text-amber-500", "text-emerald-600"][strengthLevel];
  const passwordsMatch = confirmPwd.length > 0 && confirmPwd === newPwd;

  useEffect(() => {
    if (open) {
      reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = (values: FormValues) => {
    updateProfile.mutateAsync(
      {
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      },
      {
        onSuccess: () => {
          toast.success("Mot de passe modifié avec succès");
          onClose();
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: Record<string, string[]> | { error?: string } } };
          const data = err.response?.data;
          if (!data) {
            toast.error("Erreur lors de la mise à jour.");
            return;
          }
          if ("error" in data && data.error) {
            const errorMessage = Array.isArray(data.error) ? data.error.join(" ") : data.error;
            setError("current_password", { message: errorMessage });
            return;
          }
          const msg = Object.values(data as Record<string, string[]>)
            .flat()
            .join(" ");
          setError("root", { message: msg || "Erreur lors du changement." });
        },
      },
    );
  };

  return (
    <>
      <div className="backdrop-animate fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md panel-animate">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="font-bold text-secondary-900">Changer mon mot de passe</h2>
              <p className="text-xs text-secondary-400">Sécurité du compte</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="flex items-center gap-2 pb-1">
              <ShieldCheck size={14} className="text-primary-600" />
              <p className="text-xs font-bold uppercase tracking-wide text-secondary-500">Vérification d&apos;identité</p>
            </div>

            {/* Current password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
                Mot de passe actuel <span className="text-primary-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2.5 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("current_password", { required: "Champ obligatoire" })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-secondary-400 hover:text-secondary-600"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.current_password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={11} />
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="h-px bg-secondary-100" />
            <p className="text-xs font-bold uppercase tracking-wide text-secondary-500">Nouveau mot de passe</p>

            {/* New password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
                Nouveau mot de passe <span className="text-primary-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2.5 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("new_password", {
                    required: "Champ obligatoire",
                    minLength: { value: 8, message: "Minimum 8 caractères" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-secondary-400 hover:text-secondary-600"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.new_password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={11} />
                  {errors.new_password.message}
                </p>
              )}
              {newPwd.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strengthLevel ? strengthColor : "bg-secondary-100"}`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strengthTextColor}`}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
                Confirmation <span className="text-primary-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2.5 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("confirm_password", {
                    required: "Champ obligatoire",
                    validate: (val) => val === newPwd || "Les mots de passe ne correspondent pas",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-secondary-400 hover:text-secondary-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={11} />
                  {errors.confirm_password.message}
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <Check size={11} />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            <p className="text-xs text-secondary-400">Minimum 8 caractères.</p>

            {errors.root && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 flex items-start gap-1.5 text-xs text-red-600">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-secondary-100 bg-secondary-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-secondary-200 bg-white px-5 py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {updateProfile.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Check size={14} />
              )}
              Modifier
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
