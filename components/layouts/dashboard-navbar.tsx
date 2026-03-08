"use client";

import { useState, type ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Tag,
  Truck,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/layouts/language-switcher";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  translationKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, translationKey: "title" },
  { key: "orders", href: "/dashboard/orders", icon: ClipboardList, translationKey: "orders" },
  { key: "products", href: "/dashboard/products", icon: Package, translationKey: "products" },
  { key: "categories", href: "/dashboard/categories", icon: Tag, translationKey: "categories" },
  { key: "delivery", href: "/dashboard/delivery", icon: Truck, translationKey: "delivery" },
  { key: "settings", href: "/dashboard/settings", icon: Settings, translationKey: "settings" },
];

interface NavLinkItemProps {
  item: NavItem;
  isRTL: boolean;
  t: ReturnType<typeof useTranslations>;
  onClose?: () => void;
}

function NavLinkItem({ item, isRTL, t, onClose }: NavLinkItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;

  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`
        group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
        transition-all duration-200
        ${isRTL ? "flex-row-reverse" : ""}
        ${
          isActive
            ? "bg-white text-primary-600 shadow-sm"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <Icon
        size={18}
        className={`shrink-0 transition-transform duration-200 group-hover:scale-110
          ${isActive ? "text-primary-600" : "text-white/70 group-hover:text-white"}`}
      />
      <span className="flex-1 truncate">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(t as any)(item.translationKey)}
      </span>
      {isActive && (
        <ChevronRight
          size={14}
          className={`shrink-0 text-primary-400 ${isRTL ? "rotate-180" : ""}`}
        />
      )}
    </Link>
  );
}

interface SidebarContentProps {
  isRTL: boolean;
  t: ReturnType<typeof useTranslations>;
  user: { first_name: string; last_name: string; email: string } | null;
  onClose?: () => void;
  onLogout: () => void;
}

function SidebarContent({ isRTL, t, user, onClose, onLogout }: SidebarContentProps) {
  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.email
    : "";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-primary-700 to-primary-800">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 border-b border-white/10 px-5 py-5 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <ShoppingBag size={18} className="text-white" />
        </div>
        <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
          <p className="text-sm font-bold tracking-wide text-white">BOUTIQUE</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/60">
            Dashboard
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLinkItem
            key={item.key}
            item={item}
            isRTL={isRTL}
            t={t}
            onClose={onClose}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-3 py-4 space-y-3">
        {/* Language switcher */}
        <div
          className={`flex items-center gap-2 px-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-xs font-medium text-white/60">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          </span>
          <LanguageSwitcher />
        </div>

        {/* User info */}
        <div
          className={`flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
            {initials || "?"}
          </div>
          <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="truncate text-xs text-white/60">{user?.email ?? ""}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm
            font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white
            ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <LogOut size={16} className="shrink-0" />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(t as any)("logout")}
        </button>
      </div>
    </div>
  );
}

interface DashboardNavbarProps {
  children: ReactNode;
}

export default function DashboardNavbar({ children }: DashboardNavbarProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const logoutMutation = useLogout();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      router.replace("/login");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  }

  return (
    <div
      className={`flex min-h-screen bg-gray-50 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:flex lg:flex-col">
        <div className="sticky top-0 h-screen">
          <SidebarContent
            isRTL={isRTL}
            t={t}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`fixed inset-y-0 z-50 w-64 lg:hidden ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              <SidebarContent
                isRTL={isRTL}
                t={t}
                user={user}
                onClose={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary-600 hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
              <ShoppingBag size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-secondary-900">
              BOUT<span className="text-primary-600">IQUE</span>
            </span>
          </div>
          <div className="w-9" aria-hidden="true" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
