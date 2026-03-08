"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Users as UsersIcon, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import UserForm, { type UserFormValues } from "@/components/UserForm";
import { useCreateUser } from "@/hooks/users";
import { useMyProfile } from "@/hooks/auth";

export default function NewUserPage() {
  const t = useTranslations("Pages.Users");
  const router = useRouter();

  const { data: me, isLoading: isLoadingMe } = useMyProfile();
  const createUser = useCreateUser();

  const canManageUsers = me && me.role === "directeur";

  const handleSubmit = (values: UserFormValues) => {
    if (!values.password) {
      toast.error("Le mot de passe est obligatoire.");
      return;
    }
    createUser.mutateAsync(
      {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role,
        password: values.password,
        is_active: values.is_active,
      },
      {
        onSuccess: () => {
          toast.success("Utilisateur créé avec succès");
          router.push("../users");
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: Record<string, string[]> } };
          const messages = err.response?.data && Object.values(err.response.data).flat().join(" ");
          toast.error(messages || "Erreur lors de la création de l'utilisateur");
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
              <p>Seul le rôle &quot;directeur&quot; peut créer des utilisateurs.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader title="Nouvel utilisateur" subtitle="Créer un compte utilisateur" icon={UsersIcon} />
      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
          <UserForm mode="create" onSubmit={handleSubmit} isSubmitting={createUser.isPending} showPasswordField />
        </div>
      </div>
    </div>
  );
}
