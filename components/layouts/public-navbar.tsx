"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, ShoppingBag } from "lucide-react";
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", labelKey: "home" as const },
    { href: "/products", labelKey: "products" as const },
    { href: "/track", labelKey: "track" as const },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 w-full bg-white transition-shadow duration-300
          ${scrolled ? "shadow-md" : "shadow-none border-b border-gray-100"}
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-wide text-secondary-900">
              BOUT
              <span className="text-primary-600">IQUE</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            className={`hidden md:flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
            aria-label="Main navigation"
          >
            {navLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={`
                  rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                  ${
                    isActive(href)
                      ? "bg-primary-50 text-primary-600 font-semibold"
                      : "text-secondary-600 hover:bg-gray-100 hover:text-secondary-900"
                  }
                `}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div
            className={`hidden md:flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 active:scale-95"
            >
              {t("login")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-secondary-600 transition-colors hover:bg-gray-100 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
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
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 right-0 top-16 z-50 border-b border-gray-200 bg-white px-4 pb-6 pt-4 shadow-lg md:hidden"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map(({ href, labelKey }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      rounded-xl px-4 py-3 text-base font-medium transition-all duration-150
                      ${
                        isActive(href)
                          ? "bg-primary-50 text-primary-600 font-semibold"
                          : "text-secondary-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {t(labelKey)}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
                <div className={`flex items-center ${isRTL ? "justify-end" : "justify-start"}`}>
                  <LanguageSwitcher />
                </div>
                <Link
                  href="/login"
                  className="w-full rounded-xl bg-primary-600 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700"
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
