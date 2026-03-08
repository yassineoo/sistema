"use client";

import { useState, useEffect } from "react";
import { subscribeToPush } from "@/utils/webPush";
import { useLocale } from "next-intl";
import { Menu, Bell, BellOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Sidebar from "./Sidebar";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { useNotificationCount } from "@/hooks/notifications";
import { useAuth } from "@/contexts/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changePwdModalOpen, setChangePwdModalOpen] = useState(false);

  const locale = useLocale();
  const isRTL = locale === "ar";

  const [pushBlocked, setPushBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "denied") {
      setPushBlocked(true);
      return;
    }
    subscribeToPush()
      .then((sub) => {
        if (!sub) setPushBlocked(true);
      })
      .catch(console.error);
  }, []);

  const handleEnableNotifications = () => {
    subscribeToPush()
      .then((sub) => {
        if (sub) setPushBlocked(false);
      })
      .catch(console.error);
  };

  const { data: countData } = useNotificationCount();
  const unread = countData?.unread_count ?? 0;

  const { user } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "";

  return (
    <div className="flex h-screen overflow-hidden bg-accent">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="backdrop-animate fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        role="manager"
        userName={userName}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        onEditProfile={() => setProfileModalOpen(true)}
        onChangePassword={() => setChangePwdModalOpen(true)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className={`flex shrink-0 items-center justify-between border-b border-secondary-200 bg-white px-4 py-3 lg:hidden ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-secondary-600 transition-colors hover:bg-secondary-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <p className="text-sm font-bold text-secondary-900">Ibn Badis</p>
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-secondary-600 transition-colors hover:bg-secondary-100"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white ring-2 ring-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </header>

        {pushBlocked && Notification.permission !== "denied" && (
          <div className="flex shrink-0 items-center justify-between gap-3 bg-amber-50 px-4 py-2 text-sm text-amber-800 border-b border-amber-200">
            <span className="flex items-center gap-2">
              <BellOff size={15} />
              Activez les notifications pour recevoir les alertes en temps réel.
            </span>
            <button
              onClick={handleEnableNotifications}
              className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
            >
              Activer
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Global modals — rendered above all content */}
      <EditProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <ChangePasswordModal open={changePwdModalOpen} onClose={() => setChangePwdModalOpen(false)} />
    </div>
  );
}
