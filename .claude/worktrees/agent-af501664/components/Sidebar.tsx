"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Home, Bell, Users, Wallet, ScrollText, UserCog, ChevronUp, Pencil, KeyRound, LogOut, ClipboardList, X } from "lucide-react";
import { useNotificationCount } from "@/hooks/notifications";
import { useAuth } from "@/contexts/AuthContext";

type Role = "manager" | "cashier" | "secrétaire" | "directeur" | "agent_polyvalent" | "infographe" | "opérateur";

interface SidebarProps {
  role?: Role;
  userName?: string;
  userRole?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

interface NavItem {
  key: string;
  icon: React.ElementType;
  href: string;
  roles: Role[];
  dynamicBadge?: boolean;
  badge?: {
    value: string;
    variant: "primary" | "amber";
    pulse?: boolean;
  };
}

const NAV_MAIN: NavItem[] = [
  {
    key: "dashboard",
    icon: Home,
    href: "/dashboard",
    roles: [ "directeur"],
  },
  // { key: "caisses", icon: CreditCard, href: "/caisses", roles: ["manager", "cashier"] }, // coming soon
  {
    key: "orders",
    icon: ClipboardList,
    href: "/orders",
    roles: ["secrétaire", "agent_polyvalent","directeur","infographe","opérateur","directeur"],
    badge: { value: "12", variant: "amber", pulse: true },
  },
  {
    key: "clients",
    icon: Users,
    href: "/clients",
    roles: ["secrétaire","directeur"],
  },
  {
    key: "payments",
    icon: Wallet,
    href: "/payments",
    roles: ["secrétaire","directeur"],
    badge: { value: "84 000 DZD", variant: "amber", pulse: true },
  },
  // { key: "reports", icon: BarChart2, href: "/reports", roles: ["manager"] }, // coming soon
  {
    key: "activity",
    icon: ScrollText,
    href: "/activity",
    roles: ["directeur"],
  },
  {
    key: "notifications",
    icon: Bell,
    href: "/notifications",
    roles: ["secrétaire", "agent_polyvalent","directeur","infographe","opérateur","directeur"],
    dynamicBadge: true,
  },
];

const NAV_SETTINGS: NavItem[] = [
  {
    key: "users",
    icon: UserCog,
    href: "/users",
    roles: ["directeur"],
  },
];

function NavLink({
  item,
  isRTL,
  delay,
  t,
  onMobileClose,
  liveCount,
}: {
  item: NavItem;
  isRTL: boolean;
  delay: number;
  t: ReturnType<typeof useTranslations>;
  onMobileClose?: () => void;
  liveCount?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onMobileClose}
      style={{ animationDelay: `${delay}ms` }}
      className={`
        group relative flex items-center gap-3 rounded-xl px-3 py-2.5
        text-sm font-medium transition-all duration-200
        ${isRTL ? "nav-item-animate-rtl flex-row-reverse" : "nav-item-animate"}
        ${isActive ? "bg-primary-600 text-white active-glow" : "text-secondary-300 hover:bg-secondary-800 hover:text-white"}
      `}
    >
      {/* Active left bar */}
      {isActive && (
        <span
          className={`absolute top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-white/60
            ${isRTL ? "-right-0 rounded-l-none" : "-left-0 rounded-r-none"}`}
        />
      )}

      <Icon
        size={18}
        className={`shrink-0 transition-transform duration-200 group-hover:scale-110
          ${isActive ? "text-white" : "text-secondary-400 group-hover:text-white"}`}
      />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <span className="flex-1 truncate">{(t as any)(item.key)}</span>

      {/* Static badge */}
      {item.badge && (
        <span
          className={`
            shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold leading-none
            ${item.badge.pulse ? "badge-pulse" : ""}
            ${
              item.badge.variant === "amber"
                ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                : isActive
                  ? "bg-white/20 text-white"
                  : "bg-primary-600/20 text-primary-400 ring-1 ring-primary-600/30"
            }
          `}
        >
          {item.badge.value}
        </span>
      )}

      {/* Dynamic badge (notifications count) */}
      {item.dynamicBadge && liveCount !== undefined && liveCount > 0 && (
        <span
          className={`
            shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold leading-none badge-pulse
            ${isActive ? "bg-white/20 text-white" : "bg-primary-600/20 text-primary-400 ring-1 ring-primary-600/30"}
          `}
        >
          {liveCount > 99 ? "99+" : liveCount}
        </span>
      )}
    </Link>
  );
}

export const logout = async () => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    await fetch(`${base}/auth/logout/`, {
      method: "POST",
      credentials: "include", // Send cookies
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    window.location.href = "/login";
  }
};
export default function Sidebar({
  role = "manager",
  userName = "Ahmed Benali",
  userRole,
  mobileOpen = false,
  onMobileClose,
  onEditProfile,
  onChangePassword,
}: SidebarProps) {
  const t = useTranslations("Sidebar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const user_role = user?.role || "cashier";
  const isRTL = locale === "ar";
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  const { data: countData } = useNotificationCount();
  const unreadCount = countData?.unread_count ?? 0;

  const visibleMain     = NAV_MAIN.filter((i) => i.roles.includes(user_role as Role));
  const visibleSettings = NAV_SETTINGS.filter((i) => i.roles.includes(user_role as Role));

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayRole = userRole ?? (role === "manager" ? t("manager") : t("cashier"));

  return (
    <aside
      className={`
        fixed inset-y-0 z-40 flex h-full w-64 shrink-0 flex-col
        bg-secondary-950 border-secondary-800
        transition-transform duration-300 ease-in-out
        lg:relative lg:inset-y-auto lg:z-auto lg:h-screen lg:translate-x-0
        ${
          isRTL
            ? `right-0 border-l ${mobileOpen ? "translate-x-0" : "translate-x-full"}`
            : `left-0 border-r ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
        }
      `}
    >
      {/* Subtle gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-none"
        style={{
          background: "linear-gradient(180deg, rgba(214,40,40,0.04) 0%, transparent 30%)",
        }}
      />

      {/* ── Logo ── */}
      <div
        className={`flex items-center gap-3 px-5 py-5 border-b border-secondary-800
          ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/30">
          <Image
            src="/logo.svg"
            alt="Ibn Badis logo"
            width={22}
            height={22}
            className=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
          <p className="text-sm font-bold tracking-wide text-white">Ibn Badis</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-primary-500">POS System</p>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-800 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
        {/* Main items */}
        {visibleMain.map((item, i) => (
          <NavLink
            key={item.key}
            item={item}
            isRTL={isRTL}
            delay={80 + i * 50}
            t={t}
            onMobileClose={onMobileClose}
            liveCount={item.dynamicBadge ? unreadCount : undefined}
          />
        ))}

        {/* Settings section separator */}
        {visibleSettings.length > 0 && (
          <>
            <div className={`flex items-center gap-2 px-3 pt-5 pb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className="h-px flex-1 bg-secondary-800" />
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-secondary-500">{t("settingsSection")}</span>
              <span className="h-px flex-1 bg-secondary-800" />
            </div>

            {visibleSettings.map((item, i) => (
              <NavLink key={item.key} item={item} isRTL={isRTL} delay={80 + (visibleMain.length + i) * 50} t={t} />
            ))}
          </>
        )}
      </nav>

      {/* ── Profile (pinned bottom) ── */}
      <div className="relative border-t border-secondary-800 px-3 py-3">
        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className={`dropdown-animate absolute bottom-full mb-2 w-56 rounded-2xl
              border border-secondary-700 bg-secondary-900 p-1.5 shadow-2xl
              ${isRTL ? "right-3" : "left-3"}`}
          >
            {[
              {
                icon: Pencil,
                label: t("editProfile"),
                action: () => {
                  onEditProfile?.();
                  setDropdownOpen(false);
                },
              },
              {
                icon: KeyRound,
                label: t("changePassword"),
                action: () => {
                  onChangePassword?.();
                  setDropdownOpen(false);
                },
              },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5
                  text-sm text-secondary-300 transition-colors hover:bg-secondary-800 hover:text-white
                  ${isRTL ? "flex-row-reverse text-right" : ""}`}
              >
                <Icon size={15} className="shrink-0 text-secondary-400" />
                {label}
              </button>
            ))}

            <div className="my-1 h-px bg-secondary-800" />

            {/* Language switcher */}
            <div className={`flex items-center gap-2 px-3 py-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className="text-xs text-secondary-500 shrink-0">{t("language")}:</span>
              <div className="flex gap-1">
                {(["ar", "fr", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => { switchLocale(lang); setDropdownOpen(false); }}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold uppercase transition-colors
                      ${locale === lang
                        ? "bg-primary-600 text-white"
                        : "text-secondary-400 hover:bg-secondary-800 hover:text-white"
                      }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-1 h-px bg-secondary-800" />

            <button
              onClick={() => logout()}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5
                text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300
                ${isRTL ? "flex-row-reverse text-right" : ""}`}
            >
              <LogOut size={15} className="shrink-0" />
              {t("logout")}
            </button>
          </div>
        )}

        {/* Profile trigger */}
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className={`
            group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
            transition-colors hover:bg-secondary-800
            ${isRTL ? "flex-row-reverse" : ""}
          `}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-bold text-white ring-2 ring-primary-600/30">
              {initials}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-secondary-950 bg-emerald-500" />
          </div>

          <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-xs text-secondary-400">{displayRole}</p>
          </div>

          <ChevronUp
            size={15}
            className={`shrink-0 text-secondary-500 transition-transform duration-200
              ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </aside>
  );
}
