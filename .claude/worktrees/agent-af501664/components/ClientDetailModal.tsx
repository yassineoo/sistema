"use client";

import { X, User, Phone, Mail, MapPin, Briefcase, Building2, Calendar, ClipboardList, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useGetItem } from "@/hooks/query";
import { useCommandes } from "@/hooks/commandes";
import type { Client, ClientType, CommandeStatus, CommandeListItem } from "@/types/schema";

const TYPE_ICON: Record<ClientType, React.ElementType> = {
  normal: User,
  sous_traitant: Briefcase,
  direction: Building2,
};

const TYPE_CLASSES: Record<ClientType, string> = {
  normal: "bg-blue-100    text-blue-700",
  sous_traitant: "bg-purple-100  text-purple-700",
  direction: "bg-primary-100 text-primary-700",
};

const STATUS_CLASSES: Record<CommandeStatus, string> = {
  en_attente: "bg-amber-100   text-amber-700",
  en_cours_de_traitement: "bg-blue-100    text-blue-700",
  terminée: "bg-emerald-100 text-emerald-700",
  revision_requise: "bg-orange-100  text-orange-700",
  en_cours_de_revision: "bg-purple-100  text-purple-700",
};

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-secondary-500">
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
        <p className="text-sm font-medium text-secondary-800 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

interface ClientDetailModalProps {
  clientId: number | null;
  onClose: () => void;
}

export default function ClientDetailModal({ clientId, onClose }: ClientDetailModalProps) {
  const t = useTranslations("Pages.ClientDetailModal");
  const ts = useTranslations("Pages.Statuses");
  const { data: clientData, isLoading } = useGetItem("clients", clientId ?? 0);
  const { data: ordersData } = useCommandes(undefined, undefined, clientId ? { client_id: clientId } : undefined);

  if (clientId === null) return null;

  const client = clientData as Client | undefined;
  const orders = (ordersData?.results ?? []) as CommandeListItem[];
  const recentOrders = orders.slice(0, 5);

  const TypeIcon = client ? (TYPE_ICON[client.type] ?? User) : User;
  const typeClasses = client ? (TYPE_CLASSES[client.type] ?? "") : "";

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("fr-DZ", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "—";

  return (
    <>
      <div className="backdrop-animate fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-lg panel-animate">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <User size={18} />
            </div>
            <div>
              <h2 className="font-bold text-secondary-900">
                {isLoading ? t("loading") : client ? `${client.first_name} ${client.last_name}` : "Client"}
              </h2>
              <p className="text-xs text-secondary-400">{t("subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 rounded-2xl bg-secondary-100" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded-full bg-secondary-100" style={{ width: `${60 + i * 10}%` }} />
              ))}
            </div>
          ) : !client ? (
            <p className="py-10 text-center text-sm text-secondary-400">{t("notFound")}</p>
          ) : (
            <>
              {/* Hero card */}
              <div className="flex items-center gap-4 rounded-2xl border border-secondary-100 bg-secondary-50 px-5 py-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-secondary-700 to-secondary-900 text-xl font-bold text-white shadow-md">
                  {client.first_name[0]}
                  {client.last_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-secondary-900">
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-sm text-secondary-500">{client.phone}</p>
                  {client.type && (
                    <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeClasses}`}>
                      <TypeIcon size={11} />
                      {t(client.type === "normal" ? "typeNormal" : client.type === "sous_traitant" ? "typeSousTraitant" : "typeDirection")}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <section>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary-400">
                  <Phone size={12} /> {t("contactSection")}
                </h3>
                <div className="space-y-3">
                  <InfoRow icon={Phone} label={t("phoneLabel")} value={client.phone} />
                  {client.email && <InfoRow icon={Mail} label={t("emailLabel")} value={client.email} />}
                  {client.adresse && <InfoRow icon={MapPin} label={t("addressLabel")} value={client.adresse} />}
                  {client.secteur_activite && <InfoRow icon={Briefcase} label={t("sectorLabel")} value={client.secteur_activite} />}
                  <InfoRow icon={Calendar} label={t("deadlineLabel")} value={client.delai + "j"} />
                </div>
              </section>

              <div className="h-px bg-secondary-100" />

              {/* Recent orders */}
              <section>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary-400">
                  <ClipboardList size={12} /> {t("ordersSection")} ({orders.length})
                </h3>
                {recentOrders.length === 0 ? (
                  <p className="py-6 text-center text-sm text-secondary-400">{t("noOrders")}</p>
                ) : (
                  <div className="space-y-2">
                    {recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-xl border border-secondary-100 bg-white px-4 py-2.5">
                        <div>
                          <span className="font-mono text-xs font-semibold text-secondary-500">#{o.id}</span>
                          <p className="text-xs text-secondary-400">{formatDate(o.delai)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASSES[o.status]}`}>
                          {ts(o.status)}
                        </span>
                      </div>
                    ))}
                    {orders.length > 5 && <p className="text-center text-xs text-secondary-400">{t("moreOrders", { count: orders.length - 5 })}</p>}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-100 bg-secondary-50 px-6 py-4 flex gap-3">
          {client && (
            <Link
              href={`/clients/${clientId}`}
              onClick={onClose}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              <ExternalLink size={14} />
              {t("fullHistory")}
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-secondary-200 bg-white py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100"
          >
            {t("close")}
          </button>
        </div>
      </aside>
    </>
  );
}
