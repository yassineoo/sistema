"use client";

import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Users as UsersIcon, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import UserForm, { type UserFormValues } from "@/components/UserForm";
import { useUser, useUpdateUser } from "@/hooks/users";
import { useMyProfile } from "@/hooks/auth";

export default function EditUserPage() {
  const t = useTranslations("Pages.Users");
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params.id);

  const { data: me, isLoading: isLoadingMe } = useMyProfile();
  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUser();

  const canManageUsers = me && me.role === "directeur";

  const handleSubmit = (values: UserFormValues) => {
    updateUser.mutateAsync(
      {
        id,
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
          router.push("../../users");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: Record<string, string[]> } };
          const messages = err.response?.data && Object.values(err.response.data).flat().join(" ");
          toast.error(messages || "Erreur lors de la mise à jour");
        },
      },
    );
  };

  if (!isLoadingMe && !canManageUsers) {
    return (
      <div className="flex flex-col min-h-full bg-accent">
        <PageHeader title={t("title")} subtitle={t("subtitle")} icon={UsersIcon} />
        <div className="p-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 flex items-start gap-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">Accès restreint</p>
              <p>Seul le rôle &quot;directeur&quot; peut modifier les utilisateurs.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader title="Modifier l'utilisateur" subtitle="Mettre à jour les informations du compte" icon={UsersIcon} />
      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
          {isLoading || !user ? (
            <p className="text-sm text-secondary-400">Chargement...</p>
          ) : (
            <UserForm mode="edit" initialValues={user} onSubmit={handleSubmit} isSubmitting={updateUser.isPending} showPasswordField={false} />
          )}
        </div>
      </div>
    </div>
  );
}
