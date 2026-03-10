"use client";

import { Star, Tag, ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types/api";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem, openCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const imageSrc = product.main_image ?? product?.gallery?.[0]?.image ?? null;
  const isOutOfStock = product.stock === 0;
  const hasPromo = Boolean(product.compare_price && Number(product.compare_price) > Number(product.price));
  const nameInitial = product.name.charAt(0).toUpperCase();
  const inCart = items.some((i) => i.product_id === product.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: imageSrc,
      unit_price: product.price,
      stock: product.stock,
      slug: product.slug,
    });

    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1800);
  }

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
            <img src={imageSrc} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-600 to-primary-800">
              <span className="font-display text-4xl font-black text-white/70 sm:text-6xl">{nameInitial}</span>
            </div>
          )}

          {isOutOfStock && <div className="absolute inset-0 bg-secondary-900/40" />}

          {/* Stock badge */}
          <div className="absolute right-2 top-2">
            {isOutOfStock ? (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                Rupture
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                En stock
              </span>
            )}
          </div>

          {/* Left badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900 shadow-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                <Star size={8} className="fill-amber-900 sm:hidden" />
                <Star size={10} className="fill-amber-900 hidden sm:block" />
                Vedette
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
          {product.subcategory && (
            <span className="inline-block w-fit rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 sm:text-xs">
              {product.subcategory.name}
            </span>
          )}
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-secondary-900 sm:text-base">{product.name}</h3>
          {!compact && product.description && (
            <p className="hidden line-clamp-2 text-xs leading-relaxed text-secondary-500 sm:block sm:text-sm">{product.description}</p>
          )}
        </div>

        {/* ── Price ────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-secondary-100 px-3 py-2 sm:px-4">
          <div className="flex flex-col">
            {hasPromo && (
              <span className="text-[10px] text-secondary-400 line-through sm:text-xs">
                {Number(product.compare_price).toLocaleString("fr-DZ")} DA
              </span>
            )}
            <span className="font-display text-base font-black text-primary-600 sm:text-xl">{Number(product.price).toLocaleString("fr-DZ")} DA</span>
          </div>
        </div>
      </Link>

      {/* ── Add to cart button (outside Link) ────── */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          whileTap={{ scale: 0.97 }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition sm:text-sm ${
            isOutOfStock
              ? "cursor-not-allowed bg-secondary-100 text-secondary-400"
              : inCart
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-1.5"
              >
                <Check size={14} />
                Ajouté !
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-1.5"
              >
                <ShoppingCart size={14} />
                {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
