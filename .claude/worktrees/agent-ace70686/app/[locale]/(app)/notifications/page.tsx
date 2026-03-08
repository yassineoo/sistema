"use client";

import { useState } from "react";
import { Bell, Package, AlertTriangle, CheckCheck, Check, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/notifications";
import type { Notification } from "@/types/schema";

const PAGE_SIZE = 10;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `il y a ${diffD}j`;
  if (diffH > 0) return `il y a ${diffH}h`;
  if (diffMin > 0) return `il y a ${diffMin}min`;
  return "à l'instant";
}

function NotificationRow({ n, onMarkRead, isPending }: { n: Notification; onMarkRead: (id: number) => void; isPending: boolean }) {
  const isRevision = n.type === "revision_requise";
  const isUrgent = n.commande?.is_urgent;
  return (
    <div className={`flex items-start gap-4 px-5 py-4 transition-colors ${
      isUrgent ? "bg-red-50/60" : !n.is_read ? "bg-primary-50/40" : "bg-white hover:bg-secondary-50/50"
    }`}>
      {/* Icon */}
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        isUrgent ? "bg-red-100" : isRevision ? "bg-amber-100" : "bg-primary-100"
      }`}>
        {isUrgent
          ? <Zap size={16} className="text-red-600" />
          : isRevision
            ? <AlertTriangle size={16} className="text-amber-600" />
            : <Package size={16} className="text-primary-600" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {!n.is_read && <span className={`h-2 w-2 shrink-0 rounded-full ${isUrgent ? "bg-red-600" : "bg-primary-600"}`} />}
          <p className={`text-sm ${!n.is_read ? "font-semibold text-secondary-900" : "font-medium text-secondary-700"}`}>
            {isRevision ? "Révision requise" : "Nouvelle commande"}
          </p>
          {isUrgent && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-700">
              <Zap size={8} />URGENT
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-secondary-500 truncate">
          Commande #{n.commande?.id}
          {n.commande?.client ? ` — ${n.commande.client.first_name} ${n.commande.client.last_name}` : ""}
        </p>
        <p className="mt-1 text-xs text-secondary-400">{timeAgo(n.created_at)}</p>
      </div>

      {/* Action */}
      <div className="shrink-0 flex items-center gap-2">
        {!n.is_read ? (
          <button
            type="button"
            onClick={() => onMarkRead(n.id)}
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg border border-secondary-200 bg-white px-2.5 py-1 text-xs font-medium text-secondary-600 transition-colors hover:bg-secondary-50 hover:text-secondary-900 disabled:opacity-50"
          >
            <Check size={11} />
            Lu
          </button>
        ) : (
          <CheckCheck size={14} className="text-secondary-300" />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-secondary-50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-secondary-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 rounded-full bg-secondary-100" />
            <div className="h-3 w-64 rounded-full bg-secondary-100" />
            <div className="h-2.5 w-20 rounded-full bg-secondary-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useNotifications(page, PAGE_SIZE);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications: Notification[] = data?.results ?? [];
  const total: number = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = (id: number) => {
    markRead.mutateAsync(id, {
      onSuccess: () => toast.success("Notification marquée comme lue"),
      onError: () => toast.error("Erreur lors de la mise à jour"),
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutateAsync();
  };

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader
        title="Notifications"
        subtitle="Vos alertes et mises à jour en temps réel"
        icon={Bell}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 shadow-sm transition-colors hover:bg-secondary-50 disabled:opacity-60"
            >
              <CheckCheck size={15} />
              Tout marquer comme lu
            </button>
          ) : undefined
        }
      />

      <div className="p-4 sm:p-8 space-y-4">
        {/* Error */}
        {isError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 flex items-start gap-3 text-sm text-red-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Impossible de charger les notifications</p>
              <button onClick={() => refetch()} className="mt-1 text-xs underline">
                Réessayer
              </button>
            </div>
          </div>
        )}

        {!isError && (
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <LoadingSkeleton />
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-secondary-400">
                <Bell size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">Aucune notification</p>
                <p className="text-xs mt-1 text-secondary-300">Tout est à jour !</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-50">
                {notifications.map((n) => (
                  <NotificationRow key={n.id} n={n} onMarkRead={handleMarkRead} isPending={markRead.isPending} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-secondary-100 px-5 py-3">
                <p className="text-xs text-secondary-400">
                  {total} notification{total !== 1 ? "s" : ""} au total
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-600 transition-colors hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="min-w-[4rem] text-center text-xs font-medium text-secondary-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-600 transition-colors hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
