"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X, UserCog, AlertCircle, Mail, User, Check } from "lucide-react";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/auth";

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { data: me } = useMyProfile();
  const updateProfile = useUpdateMyProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (open && me) {
      reset({ first_name: me.first_name, last_name: me.last_name, email: me.email });
    }
  }, [open, me, reset]);

  if (!open) return null;

  const onSubmit = (values: FormValues) => {
    updateProfile.mutateAsync(values, {
      onSuccess: () => {
        toast.success("Profil mis à jour");
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
          toast.error(data.error);
          return;
        }
        const msg = Object.values(data as Record<string, string[]>)
          .flat()
          .join(" ");
        if (msg) setError("root", { message: msg });
        else toast.error("Erreur lors de la mise à jour.");
      },
    });
  };

  return (
    <>
      <div className="backdrop-animate fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md panel-animate">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <UserCog size={18} />
            </div>
            <div>
              <h2 className="font-bold text-secondary-900">Mon profil</h2>
              <p className="text-xs text-secondary-400">Modifier mes informations</p>
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
            {/* Avatar preview */}
            {me && (
              <div className="flex items-center gap-4 rounded-2xl border border-secondary-100 bg-secondary-50 px-5 py-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-primary-700 text-xl font-bold text-white shadow-md">
                  {me.first_name[0]}
                  {me.last_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">
                    {me.first_name} {me.last_name}
                  </p>
                  <p className="text-xs text-secondary-400">{me.email}</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-600">
                    {me.role}
                  </span>
                </div>
              </div>
            )}

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
                  Prénom <span className="text-primary-600">*</span>
                </label>
                <div className="relative">
                  <User size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-secondary-200 bg-white pl-8 pr-3 py-2.5 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    {...register("first_name", { required: "Obligatoire" })}
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={11} />
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
                  Nom <span className="text-primary-600">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2.5 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("last_name", { required: "Obligatoire" })}
                />
                {errors.last_name && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={11} />
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500">
                E-mail <span className="text-primary-600">*</span>
              </label>
              <div className="relative">
                <Mail size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="email"
                  className="w-full rounded-xl border border-secondary-200 bg-white pl-8 pr-3 py-2.5 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("email", {
                    required: "Obligatoire",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail invalide" },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={11} />
                  {errors.email.message}
                </p>
              )}
            </div>

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
              Enregistrer
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
