"use client";

import { X, UserPlus, UserCog } from "lucide-react";
import { toast } from "sonner";
import UserForm, { type UserFormValues } from "@/components/UserForm";
import { useCreateUser, useUpdateUser } from "@/hooks/users";
import type { User } from "@/types/schema";

interface UserFormModalProps {
  mode: "create" | "edit";
  user?: User | null;
  open: boolean;
  onClose: () => void;
}

export default function UserFormModal({ mode, user, open, onClose }: UserFormModalProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  if (!open) return null;

  const isPending = createUser.isPending || updateUser.isPending;

  const handleSubmit = (values: UserFormValues) => {
    if (mode === "create") {
      createUser.mutateAsync(
        {
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          role: values.role,
          password: values.password ?? "",
          is_active: values.is_active,
        },
        {
          onSuccess: () => {
            toast.success("Utilisateur créé avec succès");
            onClose();
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: Record<string, string[]> } };
            const messages = err.response?.data && Object.values(err.response.data).flat().join(" ");
            toast.error(messages || "Erreur lors de la création");
          },
        },
      );
    } else if (user) {
      updateUser.mutateAsync(
        {
          id: user.id,
          data: {
            email: values.email,
            first_name: values.first_name,
            last_name: values.last_name,
            role: values.role,
            is_active: values.is_active,
          },
        },
        {
          onSuccess: () => {
            toast.success("Utilisateur mis à jour");
            onClose();
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: Record<string, string[]> } };
            const messages = err.response?.data && Object.values(err.response.data).flat().join(" ");
            toast.error(messages || "Erreur lors de la mise à jour");
          },
        },
      );
    }
  };

  const isCreate = mode === "create";

  return (
    <>
      <div className="backdrop-animate fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md panel-animate">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              {isCreate ? <UserPlus size={18} /> : <UserCog size={18} />}
            </div>
            <div>
              <h2 className="font-bold text-secondary-900">{isCreate ? "Nouvel utilisateur" : "Modifier l'utilisateur"}</h2>
              <p className="text-xs text-secondary-400">{isCreate ? "Créer un nouveau compte" : "Mettre à jour les informations"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <UserForm mode={mode} initialValues={user ?? undefined} onSubmit={handleSubmit} isSubmitting={isPending} showPasswordField={isCreate} />
        </div>
      </aside>
    </>
  );
}
