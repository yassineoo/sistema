"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { BookOpen, ExternalLink, FileText } from "lucide-react";
import { useGetCatalogs } from "@/hooks/catalogs";

export default function CatalogsShowcase() {
  const t = useTranslations("catalogsSection");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { data, isLoading } = useGetCatalogs();
  const catalogs = data?.results ?? [];

  if (!isLoading && catalogs.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`mb-10 ${isRTL ? "text-right" : "text-left"}`}
        >
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700 ${isRTL ? "flex-row-reverse" : ""}`}>
            <BookOpen size={15} />
            {t("badge")}
          </div>
          <h2 className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-secondary-500">{t("subtitle")}</p>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-secondary-100 aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {catalogs.map((catalog, i) => (
              <motion.a
                key={catalog.id}
                href={catalog.pdf_drive_link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-secondary-100 transition-shadow duration-300 hover:shadow-xl hover:shadow-secondary-900/8 hover:ring-secondary-200"
              >
                {/* Cover image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary-50">
                  {catalog.cover_image ? (
                    <img
                      src={catalog.cover_image}
                      alt={catalog.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-primary-600 to-primary-800">
                      <FileText size={40} className="text-white/70" />
                      <span className="px-4 text-center text-sm font-bold text-white/80">{catalog.name}</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-primary-900/0 transition-all duration-300 group-hover:bg-primary-900/40">
                    <div className="flex h-12 w-12 scale-0 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 group-hover:scale-100">
                      <ExternalLink size={18} className="text-primary-600" />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className={`p-3 ${isRTL ? "text-right" : "text-left"}`}>
                  <p className="line-clamp-2 text-sm font-semibold text-secondary-800 leading-snug">
                    {catalog.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary-600">
                    <BookOpen size={11} />
                    {t("viewCatalog")}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
