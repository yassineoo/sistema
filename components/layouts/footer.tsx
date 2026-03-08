"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShoppingBag, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const navLinks = [
    { href: "/", label: tNav("home") },
    { href: "/products", label: tNav("products") },
    { href: "/track", label: tNav("track") },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-primary-800 text-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-10 md:grid-cols-3 ${
            isRTL ? "md:text-right" : ""
          }`}
        >
          {/* Column 1 — Logo & Description */}
          <div className={`flex flex-col gap-4 ${isRTL ? "items-end" : "items-start"}`}>
            <Link
              href="/"
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-wide text-white">
                BOUT<span className="text-white/60">IQUE</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              {t("description")}
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
              {t("navigation")}
            </h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 transition-colors duration-150 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
              {t("contact")}
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="tel:+213555000000"
                  className={`flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Phone size={14} className="shrink-0 text-white/40" />
                  <span>{t("phone")}: +213 555 000 000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@boutique.dz"
                  className={`flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Mail size={14} className="shrink-0 text-white/40" />
                  <span>{t("email")}: contact@boutique.dz</span>
                </a>
              </li>
              <li>
                <span
                  className={`flex items-start gap-2.5 text-sm text-white/70 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-white/40" />
                  <span>Algérie</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className={`mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row ${
            isRTL ? "sm:flex-row-reverse" : ""
          }`}
        >
          <p className="text-xs text-white/40">
            &copy; {currentYear} BOUTIQUE. {t("rights")}.
          </p>
          <Link
            href="/login"
            className="text-xs text-white/30 transition-colors hover:text-white/60"
          >
            {tNav("login")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
