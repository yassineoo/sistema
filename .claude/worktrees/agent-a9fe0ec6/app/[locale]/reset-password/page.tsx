"use client";

import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useResetPassword } from "@/hooks/auth";

interface FormValues {
  new_password: string;
  confirm_password: string;
}

function isStrongPassword(value: string) {
  return value.length >= 8 && /\d/.test(value);
}

export default function ResetPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useResetPassword();

  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (values: FormValues) => {
    if (!isStrongPassword(values.new_password)) {
      return;
    }
    mutation.mutateAsync(
      {
        uid,
        token,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      },
      {
        onSuccess: () => {
          router.push(`/${locale}/login`);
        },
      },
    );
  };

  const passwordInvalid = !uid || !token || (mutation.isError && (mutation as any).error?.response?.data?.error);

  const apiError = (mutation as any).error?.response?.data?.error ?? (mutation as any).error?.response?.data?.detail ?? null;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-[#faf8f8]">
      <div className="absolute top-0 left-0 w-[80vw] h-[100vh] bg-linear-to-br from-primary-500 via-primary-400 to-transparent opacity-30 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[80vw] h-[100vh] bg-linear-to-bl from-primary-700 via-primary-500 to-transparent opacity-30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-32">
              <img src="/logo.svg" alt="Ibn Badis" className="w-full h-auto" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-secondary-700 mb-1">Réinitialiser le mot de passe</h2>
          <p className="text-sm text-secondary-500">Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <label className="block text-sm font-medium text-secondary-600 mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-0 bg-white/80 text-sm text-secondary-900 placeholder:text-secondary-400 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:outline-none shadow-sm"
                {...register("new_password", {
                  required: "Champ obligatoire",
                  validate: (value) => isStrongPassword(value) || "Au moins 8 caractères dont un chiffre",
                })}
              />
            </div>
            {errors.new_password && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-600 mb-2">Confirmation</label>
            <input
              type="password"
              className="w-full px-3 py-2.5 rounded-xl border-0 bg-white/80 text-sm text-secondary-900 placeholder:text-secondary-400 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:outline-none shadow-sm"
              {...register("confirm_password", {
                required: "Champ obligatoire",
              })}
            />
            {errors.confirm_password && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <p className="text-xs text-secondary-400">Minimum 8 caractères, avec au moins un chiffre.</p>

          {apiError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 flex items-start gap-1.5">
              <AlertCircle size={13} className="mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {passwordInvalid && !apiError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 flex items-start gap-1.5">
              <AlertCircle size={13} className="mt-0.5" />
              <span>Le lien de réinitialisation est invalide ou expiré.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || !uid || !token}
            className="w-full mt-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validation en cours...
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/${locale}/login`)}
            className="mt-2 w-full text-center text-xs text-secondary-500 hover:text-secondary-700"
          >
            Retour à la connexion
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
