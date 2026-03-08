"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthenticate } from "@/hooks/auth";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const { mutateAsync: login, isPending } = useAuthenticate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      await login({ email: data.email, password: data.password });
      router.push(`/${locale}/dashboard`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        setLoginError("Adresse e-mail ou mot de passe incorrect");
      } else {
        setLoginError("Erreur de connexion. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-[#faf8f8]">

      {/* Red/warm gradient effects — brand primary */}
      <div className="absolute top-0 left-0 w-[80vw] h-[100vh] bg-linear-to-br from-primary-500 via-primary-400 to-transparent opacity-30 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[80vw] h-[100vh] bg-linear-to-bl from-primary-700 via-primary-500 to-transparent opacity-30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 left-1/2 w-[30vw] h-[70vh] -translate-x-1/2 -translate-y-1/2">
        <div className="w-full h-full bg-linear-to-br from-amber-200 via-orange-200 to-primary-200 opacity-40 blur-3xl rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-44">
              <img src="/logo.svg" alt="Ibn Badis" className="w-full h-auto" />
            </div>
          </div>
          <h2 className="text-xl font-medium text-secondary-500">Connectez-vous</h2>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-600 mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 rounded-xl border-0 bg-white/80 backdrop-blur-sm text-secondary-900 placeholder:text-secondary-400 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:outline-none transition-all shadow-sm"
              placeholder="nom@ibnbadis.dz"
              {...register("email", {
                required: "Ce champ est requis",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Format d'adresse e-mail invalide",
                },
              })}
            />
            {errors.email && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-600 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 rounded-xl border-0 bg-white/80 backdrop-blur-sm text-secondary-900 placeholder:text-secondary-400 focus:bg-white focus:ring-2 focus:ring-primary-400 focus:outline-none transition-all shadow-sm ${isRTL ? "pl-12" : "pr-12"}`}
                placeholder="••••••••••••"
                {...register("password", {
                  required: "Ce champ est requis",
                  minLength: {
                    value: 3,
                    message: "Le mot de passe doit contenir au moins 3 caractères",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`absolute top-1/2 -translate-y-1/2 hover:bg-secondary-100 rounded-full p-1.5 transition-colors ${isRTL ? "left-3" : "right-3"}`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-secondary-400" />
                ) : (
                  <Eye className="w-5 h-5 text-secondary-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              </div>
            )}
            {loginError && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-xs">{loginError}</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-300 mt-6 shadow-md ${
              isPending
                ? "bg-secondary-400 cursor-not-allowed"
                : "bg-linear-to-r from-primary-700 to-primary-500 hover:from-primary-800 hover:to-primary-600 hover:shadow-lg"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion en cours...
              </span>
            ) : (
              "Continuer"
            )}
          </motion.button>

          {/* Forgot password */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/forgot-password`)}
              className="text-primary-700 hover:text-primary-800 text-sm font-medium hover:underline transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </motion.form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-secondary-300">
          © 2026 Ibn Badis — Imprimerie
        </p>
      </motion.div>
    </div>
  );
}
