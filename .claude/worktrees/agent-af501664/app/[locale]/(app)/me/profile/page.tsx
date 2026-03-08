"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserCog, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/auth";

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

function isStrongPassword(value: string) {
  return value.length >= 8 && /\d/.test(value);
}

export default function MyProfilePage() {
  const t = useTranslations("Pages.Users");
  const locale = useLocale();
  const router = useRouter();

  const { data: me, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    values: me
      ? {
          first_name: me.first_name,
          last_name: me.last_name,
          email: me.email,
        }
      : undefined,
  });

  const onSubmit = (values: ProfileFormValues) => {
    setServerError(null);

    const wantsPasswordChange = values.current_password || values.new_password || values.confirm_password;

    if (wantsPasswordChange) {
      if (!values.current_password || !values.new_password || !values.confirm_password) {
        toast.error("Tous les champs de mot de passe sont obligatoires.");
        return;
      }
      if (!isStrongPassword(values.new_password)) {
        toast.error("Le mot de passe doit contenir au moins 8 caractères et un chiffre.");
        return;
      }
    }

    updateProfile.mutateAsync(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        current_password: values.current_password || undefined,
        new_password: values.new_password || undefined,
        confirm_password: values.confirm_password || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Profil mis à jour");
          router.push(`/${locale}/dashboard`);
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: Record<string, string[]> | { error?: string } } };
          const data = err.response?.data;
          if (!data) {
            setServerError("Erreur lors de la mise à jour du profil.");
            return;
          }
          if ("error" in data && data.error) {
            const errorMsg = Array.isArray(data.error) ? data.error.join(" ") : data.error;
            setServerError(errorMsg);
            return;
          }
          const messages = Object.values(data).flat().join(" ");
          setServerError(messages || "Erreur lors de la mise à jour du profil.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader title="Mon profil" subtitle="Gérer vos informations personnelles et votre mot de passe" icon={UserCog} />
      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
          {isLoading || !me ? (
            <p className="text-sm text-secondary-400">Chargement...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    {...register("first_name", { required: "Champ obligatoire" })}
                  />
                  {errors.first_name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} />
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    {...register("last_name", { required: "Champ obligatoire" })}
                  />
                  {errors.last_name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} />
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">E-mail</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("email", {
                    required: "Champ obligatoire",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Adresse e-mail invalide",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="border-t border-secondary-100 pt-4 mt-2">
                <p className="text-sm font-semibold text-secondary-800 mb-3">Changer mon mot de passe (optionnel)</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      {...register("current_password")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      {...register("new_password")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Confirmation du nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      {...register("confirm_password")}
                    />
                  </div>
                  <p className="text-xs text-secondary-400">Minimum 8 caractères, avec au moins un chiffre.</p>
                </div>
              </div>

              {serverError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 flex items-start gap-1.5">
                  <AlertCircle size={13} className="mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
