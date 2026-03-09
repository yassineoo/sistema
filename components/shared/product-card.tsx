"use client";

import { Star, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/types/api";

interface ProductCardProps {
  product: Product;
  onAddToOrder?: (product: Product) => void;
  compact?: boolean;
}

export default function ProductCard({
  product,
  compact = false,
}: ProductCardProps) {
  const t = useTranslations("products");

  const imageSrc = product.main_image ?? product.gallery[0]?.image ?? null;
  const isOutOfStock = product.stock === 0;
  const hasPromo = Boolean(product.compare_price && Number(product.compare_price) > Number(product.price));
  const nameInitial = product.name.charAt(0).toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-secondary-100 transition-shadow duration-300 hover:shadow-xl hover:shadow-secondary-900/8 hover:ring-secondary-200"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-1">

        {/* ── Image ─────────────────────────────────── */}
        <div className="relative aspect-4/3 w-full overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-600 to-primary-800">
              <span className="font-display text-4xl font-black text-white/70 sm:text-6xl">
                {nameInitial}
              </span>
            </div>
          )}

          {/* Out-of-stock dim */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-secondary-900/40" />
          )}

          {/* Stock badge — top right */}
          <div className="absolute right-2 top-2">
            {isOutOfStock ? (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                {t("outOfStock")}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                {t("inStock")}
              </span>
            )}
          </div>

          {/* Left badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900 shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                <Star size={8} className="fill-amber-900 sm:hidden" />
                <Star size={10} className="fill-amber-900 hidden sm:block" />
                {t("featured")}
              </span>
            )}
            {hasPromo && (
              <span className="flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                <Tag size={8} className="sm:hidden" />
                <Tag size={10} className="hidden sm:block" />
                Promo
              </span>
            )}
          </div>
        </div>

        {/* ── Body ──────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
          {/* Category chip */}
          {product.subcategory && (
            <span className="inline-block w-fit rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 sm:text-xs">
              {product.subcategory.name}
            </span>
          )}

          {/* Name */}
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-secondary-900 sm:text-base">
            {product.name}
          </h3>

          {/* Description — hide on mobile for compactness */}
          {!compact && product.description && (
            <p className="hidden line-clamp-2 text-xs leading-relaxed text-secondary-500 sm:block sm:text-sm">
              {product.description}
            </p>
          )}
        </div>

        {/* ── Footer — price only ───────────────────── */}
        <div className="flex items-center justify-between border-t border-secondary-100 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex flex-col">
            {hasPromo && (
              <span className="text-[10px] text-secondary-400 line-through sm:text-xs">
                {Number(product.compare_price).toLocaleString("fr-DZ")} DA
              </span>
            )}
            <span className="font-display text-base font-black text-primary-600 sm:text-xl">
              {Number(product.price).toLocaleString("fr-DZ")} DA
            </span>
          </div>

          {/* Arrow CTA hint */}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white sm:h-8 sm:w-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>

      </Link>
    </motion.div>
  );
}
