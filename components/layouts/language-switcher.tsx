"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("nav");

  function switchLocale(newLocale: LocaleCode) {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div
      className="flex items-center gap-1"
      aria-label={t("language")}
      role="group"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLocale(code)}
          aria-pressed={locale === code}
          className={`
            rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200
            ${
              locale === code
                ? "bg-primary-600 text-white shadow-sm shadow-primary-600/30"
                : "text-secondary-600 hover:bg-gray-100 hover:text-secondary-900"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
