"use client";

import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { useForgotPassword } from "@/hooks/auth";

interface FormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const mutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (values: FormValues) => {
    mutation.mutateAsync({ email: values.email });
  };

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
          <h2 className="text-xl font-semibold text-secondary-700 mb-1">Mot de passe oublié</h2>
          <p className="text-sm text-secondary-500">
            Saisissez votre adresse e-mail. Si elle est enregistrée, vous recevrez un lien de réinitialisation.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <label className="block text-sm font-medium text-secondary-600 mb-2">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-0 bg-white/80 text-sm text-secondary-900 placeholder:text-secondary-400 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:outline-none shadow-sm"
                placeholder="nom@ibnbadis.dz"
                {...register("email", {
                  required: "Ce champ est requis",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Adresse e-mail invalide",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {errors.email.message}
              </p>
            )}
          </div>

          {mutation.isSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 flex items-start gap-1.5">
              <AlertCircle size={13} className="mt-0.5" />
              <span>Si cette adresse est enregistrée, un lien de réinitialisation a été envoyé.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full mt-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer le lien"
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
