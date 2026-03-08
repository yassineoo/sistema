"use client";

import { ShoppingCart, Star } from "lucide-react";
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
  const nameInitial = product.name.charAt(0).toUpperCase();

  function handleAddToOrder() {
    if (onAddToOrder && !isOutOfStock) {
      onAddToOrder(product);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Image section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
            <span className="text-5xl font-black text-white/80">
              {nameInitial}
            </span>
          </div>
        )}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40" />
        )}

        {/* Stock badge — top right */}
        <div className="absolute right-2 top-2">
          {isOutOfStock ? (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
              {t("outOfStock")}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
              {t("inStock")}
            </span>
          )}
        </div>

        {/* Featured badge — top left */}
        {product.is_featured && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow">
            <Star size={11} className="fill-amber-900" />
            <span>{t("featured")}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Category chip */}
        {product.category && (
          <span className="inline-block w-fit rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-500">
            {product.category.name}
          </span>
        )}

        {/* Product name */}
        <h3 className="line-clamp-2 font-semibold leading-snug text-secondary-900">
          {product.name}
        </h3>

        {/* Description — hidden in compact mode */}
        {!compact && product.description && (
          <p className="line-clamp-2 text-sm text-secondary-500">
            {product.description}
          </p>
        )}
      </div>

      {/* Card footer */}
      <div className="flex flex-col gap-3 border-t border-secondary-100 p-4 pt-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          {product.compare_price && (
            <span className="text-sm text-secondary-400 line-through">
              {Number(product.compare_price).toLocaleString()} DA
            </span>
          )}
          <span className="text-xl font-bold text-primary-600">
            {Number(product.price).toLocaleString()} DA
          </span>
        </div>

        {/* Add to order button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToOrder}
          disabled={isOutOfStock}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={16} />
          <span>{t("addToOrder")}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
