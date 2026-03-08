"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/layouts/language-switcher";

export default function PublicNavbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const isRTL = locale === "ar";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", labelKey: "home" as const },
    { href: "/products", labelKey: "promotions" as const },
    { href: "/about", labelKey: "about" as const },
    { href: "/categories", labelKey: "categories" as const },
    { href: "/contact", labelKey: "contact" as const },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 w-full transition-all duration-300
          ${
            scrolled
              ? "bg-white/95 shadow-lg shadow-secondary-900/8 backdrop-blur-md"
              : "bg-white border-b border-secondary-100"
          }
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* ── Logo ─────────────────────────────────── */}
          <Link
            href="/"
            className={`flex items-center gap-3 shrink-0 group ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {/* Logo image */}
            <img
              src="/logo.jpeg"
              alt="Sestima Confort"
              className="h-10 w-auto rounded-xl object-contain transition-transform duration-200 group-hover:scale-105"
            />
            {/* Tagline — desktop only */}
            <span className="mt-0.5 hidden text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-secondary-400 sm:block">
              {t("tagline")}
            </span>
          </Link>

          {/* ── Desktop nav links ─────────────────────── */}
          <nav
            className={`hidden md:flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
            aria-label="Main navigation"
          >
            {navLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={`
                  relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${
                    isActive(href)
                      ? "text-primary-600"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  }
                `}
              >
                {isActive(href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary-50"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* ── Desktop right actions ─────────────────── */}
          <div
            className={`hidden md:flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <LanguageSwitcher />
          </div>

          {/* ── Mobile hamburger ──────────────────────── */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary-600 transition-colors hover:bg-secondary-50 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mobileOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-secondary-900/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-0 right-0 top-[73px] z-50 bg-white shadow-xl md:hidden"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {/* Nav links */}
              <nav className="flex flex-col px-4 pt-4 pb-2" aria-label="Mobile navigation">
                {navLinks.map(({ href, labelKey }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={href}
                      className={`
                        flex items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-150
                        ${
                          isActive(href)
                            ? "bg-primary-50 text-primary-600"
                            : "text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                        }
                      `}
                    >
                      {t(labelKey)}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom actions */}
              <div className="flex flex-col gap-3 border-t border-secondary-100 px-4 py-4">
                <div className={`flex items-center ${isRTL ? "justify-end" : "justify-start"}`}>
                  <LanguageSwitcher />
                </div>
                <Link
                  href="/login"
                  className="w-full rounded-xl border border-secondary-200 py-3 text-center text-sm font-medium text-secondary-500 transition-colors hover:bg-secondary-50"
                >
                  {t("login")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
