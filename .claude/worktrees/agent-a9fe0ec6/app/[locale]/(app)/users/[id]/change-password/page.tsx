"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { KeyRound, Users as UsersIcon, ShieldAlert, AlertCircle, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAdminChangePassword, useUser } from "@/hooks/users";
import { useMyProfile } from "@/hooks/auth";

interface FormValues {
  new_password: string;
  confirm_password: string;
}

export default function AdminChangePasswordPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: me, isLoading: isLoadingMe } = useMyProfile();
  const { data: user } = useUser(id);
  const mutation = useAdminChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const newPwd = watch("new_password", "");
  const confirmPwd = watch("confirm_password", "");
  const canManageUsers = me && me.role === "directeur";

  const strengthLevel = newPwd.length === 0 ? 0 : newPwd.length < 8 ? 1 : newPwd.length < 12 ? 2 : 3;

  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400"][strengthLevel];
  const strengthLabel = ["", "Trop court", "Acceptable", "Solide"][strengthLevel];
  const strengthTextColor = ["", "text-red-500", "text-amber-500", "text-emerald-600"][strengthLevel];

  const passwordsMatch = confirmPwd.length > 0 && confirmPwd === newPwd;

  const onSubmit = (values: FormValues) => {
    mutation.mutateAsync(
      { id, new_password: values.new_password, confirm_password: values.confirm_password },
      {
        onSuccess: () => {
          toast.success("Mot de passe modifié avec succès");
          router.push("../../users");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: Record<string, string[]> } };
          const messages = err.response?.data && Object.values(err.response.data).flat().join(" ");
          toast.error(messages || "Erreur lors du changement de mot de passe");
        },
      },
    );
  };

  if (!isLoadingMe && !canManageUsers) {
    return (
      <div className="flex flex-col min-h-full bg-accent">
        <PageHeader title="Changer le mot de passe" subtitle="Sécurité du compte" icon={UsersIcon} />
        <div className="p-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 flex items-start gap-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Accès restreint</p>
              <p>Seul le rôle &quot;directeur&quot; peut changer le mot de passe d&apos;un utilisateur.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title="Changer le mot de passe"
        subtitle={user ? `Compte : ${user.first_name} ${user.last_name}` : "Sécurité du compte"}
        icon={KeyRound}
      />

      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-md space-y-4">
          {/* User info card */}
          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-secondary-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-secondary-700 to-secondary-900 text-sm font-bold text-white">
                {user.first_name[0]}
                {user.last_name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="truncate text-xs text-secondary-400">{user.email}</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-secondary-100">
              <ShieldCheck size={16} className="text-primary-600" />
              <h2 className="text-sm font-bold text-secondary-800">Nouveau mot de passe</h2>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2.5 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("new_password", {
                    required: "Champ obligatoire",
                    minLength: { value: 8, message: "Minimum 8 caractères" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.new_password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.new_password.message}
                </p>
              )}

              {/* Strength bar */}
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
              <label className="block text-sm font-medium text-secondary-700 mb-1">Confirmation</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2.5 pr-10 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("confirm_password", {
                    required: "Champ obligatoire",
                    validate: (val) => val === newPwd || "Les mots de passe ne correspondent pas",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.confirm_password.message}
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <Check size={12} />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            <p className="text-xs text-secondary-400">Minimum 8 caractères.</p>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Check size={14} />
                )}
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
