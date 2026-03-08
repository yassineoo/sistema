"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useChangePassword } from "@/hooks/auth";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const changePassword = useChangePassword();

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Tous les champs sont obligatoires");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success(t("passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const detail = error?.response?.data?.detail;
      toast.error(detail ?? t("error"));
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-secondary-500">{t("subtitle")}</p>
      </div>

      {/* Profile section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <User size={18} />
          </div>
          <h2 className="text-base font-semibold text-secondary-900">
            {t("profileSection")}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("email")}
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 text-sm text-secondary-600 outline-none cursor-not-allowed"
            />
          </div>

          {/* First name (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
                {t("firstName")}
              </label>
              <input
                type="text"
                value={user?.first_name ?? ""}
                readOnly
                className="h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 text-sm text-secondary-600 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
                {t("lastName")}
              </label>
              <input
                type="text"
                value={user?.last_name ?? ""}
                readOnly
                className="h-10 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 text-sm text-secondary-600 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Change password section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Lock size={18} />
          </div>
          <h2 className="text-base font-semibold text-secondary-900">
            {t("passwordSection")}
          </h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("currentPassword")}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-secondary-200 px-3 pr-10 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("newPassword")}
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-secondary-200 px-3 pr-10 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-secondary-700">
              {t("confirmPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className={`h-10 w-full rounded-xl border px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${
                  passwordError
                    ? "border-red-400 focus:border-red-400"
                    : "border-secondary-200 focus:border-primary-500"
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="mt-2 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {changePassword.isPending ? t("saving") : t("save")}
          </button>
        </form>
      </motion.section>
    </div>
  );
}
