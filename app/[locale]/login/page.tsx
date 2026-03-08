"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Loader2, Store } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { useRouter, Link } from "@/i18n/navigation";
import { useAuthenticate } from "@/hooks/auth";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const { mutateAsync: login, isPending } = useAuthenticate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login({ email: data.email, password: data.password });
      router.push("/dashboard");
    } catch {
      toast.error(t("loginError"));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-linear-to-br from-primary-700 to-primary-900"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
            <Store className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("loginTitle")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("loginSubtitle")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-gray-50 focus:bg-white"
              }`}
              {...register("email", {
                required: t("fieldRequired"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("emailInvalid"),
                },
              })}
            />
            {errors.email && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-none" />
                <p className="text-xs text-red-500">{errors.email.message}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              {t("password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isRTL ? "pl-12" : "pr-12"
                } ${
                  errors.password
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-gray-50 focus:bg-white"
                }`}
                {...register("password", {
                  required: t("fieldRequired"),
                  minLength: {
                    value: 3,
                    message: t("passwordMinLength"),
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400 ${
                  isRTL ? "left-3" : "right-3"
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-none" />
                <p className="text-xs text-red-500">{errors.password.message}</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all mt-2 ${
              isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("loggingIn")}
              </span>
            ) : (
              t("loginButton")
            )}
          </motion.button>
        </form>

        {/* Back to store */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-primary-600 transition"
          >
            {t("backToStore")}
          </Link>
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-6 text-white/40 text-xs"
      >
        © {new Date().getFullYear()} Boutique En Ligne
      </motion.p>
    </div>
  );
}
