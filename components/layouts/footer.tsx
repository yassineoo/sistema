"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  Send,
} from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [email, setEmail] = useState("");

  const navLinks = [
    { href: "/", label: tNav("home") },
    { href: "/products", label: tNav("products") },
    { href: "/track", label: tNav("track") },
  ];

  const categoryLinks = [
    { label: t("cat1") },
    { label: t("cat2") },
    { label: t("cat3") },
    { label: t("cat4") },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 text-white" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Main footer grid ─────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 ${
            isRTL ? "lg:text-right" : ""
          }`}
        >

          {/* Col 1 — Logo + description */}
          <div className={`flex flex-col gap-5 lg:col-span-1 ${isRTL ? "items-end" : "items-start"}`}>
            <Link
              href="/"
              className={`flex items-center gap-3 group ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <img
                src="/logo.jpeg"
                alt="Sestima Confort"
                className="h-10 w-auto rounded-xl object-contain brightness-0 invert opacity-90 transition-opacity group-hover:opacity-100"
              />
              <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/40">
                {t("tagline")}
              </span>
            </Link>

            <p className={`max-w-70 text-sm leading-relaxed text-white/65 ${isRTL ? "text-right" : ""}`}>
              {t("description")}
            </p>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/213555000000"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20 hover:border-white/30 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <MessageCircle size={16} className="text-white/80" />
              {t("whatsapp")}
            </a>
          </div>

          {/* Col 2 — Quick links */}
          <div className="flex flex-col gap-4">
            <h3 className={`text-xs font-bold uppercase tracking-[0.18em] text-white/40 ${isRTL ? "text-right" : ""}`}>
              {t("quickLinks")}
            </h3>
            <ul className={`flex flex-col gap-2.5 ${isRTL ? "items-end" : "items-start"}`}>
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors duration-150 hover:text-white ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <ArrowRight
                      size={12}
                      className={`shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${isRTL ? "rotate-180" : ""}`}
                    />
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className={`group inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors duration-150 hover:text-white/70 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <ArrowRight
                    size={12}
                    className={`shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${isRTL ? "rotate-180" : ""}`}
                  />
                  {tNav("login")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Categories */}
          <div className="flex flex-col gap-4">
            <h3 className={`text-xs font-bold uppercase tracking-[0.18em] text-white/40 ${isRTL ? "text-right" : ""}`}>
              {t("categoriesCol")}
            </h3>
            <ul className={`flex flex-col gap-2.5 ${isRTL ? "items-end" : "items-start"}`}>
              {categoryLinks.map(({ label }) => (
                <li key={label}>
                  <Link
                    href="/products"
                    className={`group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors duration-150 hover:text-white ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <ArrowRight
                      size={12}
                      className={`shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${isRTL ? "rotate-180" : ""}`}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div className="flex flex-col gap-4">
            <h3 className={`text-xs font-bold uppercase tracking-[0.18em] text-white/40 ${isRTL ? "text-right" : ""}`}>
              {t("contact")}
            </h3>
            <ul className="flex flex-col gap-3.5">
              <li>
                <a
                  href="tel:+213555000000"
                  className={`flex items-center gap-3 text-sm text-white/65 transition-colors hover:text-white ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Phone size={13} className="text-white/70" />
                  </span>
                  <span>+213 555 000 000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@sestimaconfort.dz"
                  className={`flex items-center gap-3 text-sm text-white/65 transition-colors hover:text-white ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Mail size={13} className="text-white/70" />
                  </span>
                  <span>contact@sestimaconfort.dz</span>
                </a>
              </li>
              <li>
                <span className={`flex items-start gap-3 text-sm text-white/65 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <MapPin size={13} className="text-white/70" />
                  </span>
                  <span className="pt-1">Algérie — toutes les wilayas</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Newsletter band ───────────────────────────── */}
      <div className="border-t border-white/10 bg-primary-900/50">
        <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${isRTL ? "sm:flex-row-reverse" : ""}`}>
          <div className={isRTL ? "text-right" : ""}>
            <p className="text-sm font-semibold text-white">{t("newsletter")}</p>
            <p className="text-xs text-white/50">Recevez nos nouveautés et offres spéciales</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              className={`w-56 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/15 ${isRTL ? "text-right" : ""}`}
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
            >
              <Send size={14} />
              <span>{t("newsletterCTA")}</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div
        className={`border-t border-white/10 px-4 py-5 sm:px-6 lg:px-8`}
      >
        <div className={`mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row ${isRTL ? "sm:flex-row-reverse" : ""}`}>
          <p className="text-xs text-white/35">
            &copy; {currentYear} Sestima Confort. {t("rights")}.
          </p>
          <p className="text-xs text-white/25">
            Matériaux de construction • Outillage • Cuisine • Plomberie
          </p>
        </div>
      </div>
    </footer>
  );
}
