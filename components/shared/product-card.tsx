"use client";

import { ShoppingCart, Star, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Product } from "@/types/api";

interface ProductCardProps {
  product: Product;
  onAddToOrder?: (product: Product) => void;
  compact?: boolean;
}

export default function ProductCard({
  product,
  onAddToOrder,
  compact = false,
}: ProductCardProps) {
  const t = useTranslations("products");

  const imageSrc = product.main_image ?? product.images[0] ?? null;
  const isOutOfStock = product.stock === 0;
  const hasPromo = Boolean(product.compare_price && Number(product.compare_price) > Number(product.price));
  const nameInitial = product.name.charAt(0).toUpperCase();

  function handleAddToOrder() {
    if (onAddToOrder && !isOutOfStock) {
      onAddToOrder(product);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-secondary-100 transition-shadow duration-300 hover:shadow-xl hover:shadow-secondary-900/8 hover:ring-secondary-200"
    >
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
            <span className="font-display text-6xl font-black text-white/70">
              {nameInitial}
            </span>
          </div>
        )}

        {/* Out-of-stock dim */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-secondary-900/40" />
        )}

        {/* Stock badge — top right */}
        <div className="absolute right-2.5 top-2.5">
          {isOutOfStock ? (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              {t("outOfStock")}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              {t("inStock")}
            </span>
          )}
        </div>

        {/* Left badges stack */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-md">
              <Star size={10} className="fill-amber-900" />
              {t("featured")}
            </span>
          )}
          {hasPromo && (
            <span className="flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              <Tag size={10} />
              Promo
            </span>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Category chip */}
        {product.category && (
          <span className="inline-block w-fit rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <h3 className="line-clamp-2 font-bold leading-snug text-secondary-900">
          {product.name}
        </h3>

        {/* Description */}
        {!compact && product.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-secondary-500">
            {product.description}
          </p>
        )}
      </div>

      {/* ── Footer ────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-secondary-100 p-4 pt-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          {hasPromo && (
            <span className="text-sm text-secondary-400 line-through">
              {Number(product.compare_price).toLocaleString("fr-DZ")} DA
            </span>
          )}
          <span className="font-display text-2xl font-black text-primary-600">
            {Number(product.price).toLocaleString("fr-DZ")} DA
          </span>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToOrder}
          disabled={isOutOfStock}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/25 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={15} />
          <span>{t("addToOrder")}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
