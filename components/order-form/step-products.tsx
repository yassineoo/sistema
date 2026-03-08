"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, Plus, Minus, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useGetPublicProducts } from "@/hooks/products";
import type { Product } from "@/types/api";

// ── Shared wizard types ───────────────────────────────────────────────────────

type CartItem = {
  product_id: number;
  product_name: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
  stock: number;
};

type WizardData = {
  items: CartItem[];
  customer_name: string;
  customer_phone: string;
  customer_phone2: string;
  customer_wilaya_code: number;
  customer_wilaya_name: string;
  customer_address: string;
  delivery_type: "home" | "office";
  delivery_price: string;
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface StepProductsProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  initialProductId?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StepProducts({
  data,
  onUpdate,
  onNext,
  initialProductId,
}: StepProductsProps) {
  const t = useTranslations("order.form");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: productsData, isLoading } = useGetPublicProducts(
    debouncedSearch,
    page,
    "",
    "",
    "",
    "",
    ""
  );

  const products = productsData?.results ?? [];

  // Pre-add initialProductId on mount
  useEffect(() => {
    if (!initialProductId) return;
    const alreadyInCart = data.items.some((i) => i.product_id === initialProductId);
    if (alreadyInCart) return;

    // Wait for products to load so we have name/image/price
    const match = products.find((p) => p.id === initialProductId);
    if (!match) return;

    addToCart(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductId, products.length]);

  // ── Cart helpers ────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    (product: Product) => {
      const existing = data.items.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return;
        onUpdate({
          items: data.items.map((i) =>
            i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      } else {
        if (product.stock === 0) return;
        const newItem: CartItem = {
          product_id: product.id,
          product_name: product.name,
          product_image: product.main_image ?? product.images[0] ?? null,
          unit_price: product.price,
          quantity: 1,
          stock: product.stock,
        };
        onUpdate({ items: [...data.items, newItem] });
      }
    },
    [data.items, onUpdate]
  );

  const decreaseQty = useCallback(
    (productId: number) => {
      const existing = data.items.find((i) => i.product_id === productId);
      if (!existing) return;
      if (existing.quantity <= 1) {
        onUpdate({ items: data.items.filter((i) => i.product_id !== productId) });
      } else {
        onUpdate({
          items: data.items.map((i) =>
            i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i
          ),
        });
      }
    },
    [data.items, onUpdate]
  );

  const getCartQty = (productId: number) =>
    data.items.find((i) => i.product_id === productId)?.quantity ?? 0;

  const subtotal = data.items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  const canGoNext = data.items.length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
          size={18}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchProducts")}
          className="w-full rounded-xl border border-secondary-200 bg-white py-3 pl-10 pr-4 text-sm text-secondary-900 placeholder-secondary-400 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Product list */}
      <div className="max-h-96 overflow-y-auto rounded-xl border border-secondary-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-secondary-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-secondary-100" />
                  <div className="h-3 w-1/2 rounded bg-secondary-100" />
                </div>
                <div className="h-8 w-20 rounded-lg bg-secondary-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary-400">
            <Package size={36} strokeWidth={1.5} />
            <p className="text-sm">{t("noProducts")}</p>
          </div>
        ) : (
          <ul className="divide-y divide-secondary-50">
            {products.map((product) => {
              const cartQty = getCartQty(product.id);
              const outOfStock = product.stock === 0;
              const atMax = cartQty >= product.stock;
              const imageSrc = product.main_image ?? product.images[0] ?? null;

              return (
                <motion.li
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                        <span className="text-lg font-black text-white/80">
                          {product.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-semibold text-secondary-900">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-primary-600">
                      {Number(product.price).toLocaleString("fr-DZ")} DA
                    </p>
                    <span
                      className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                        outOfStock
                          ? "bg-red-100 text-red-600"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {outOfStock ? "Rupture" : `${product.stock} en stock`}
                    </span>
                  </div>

                  {/* Qty controls */}
                  <div className="flex shrink-0 items-center gap-2">
                    {cartQty > 0 ? (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => decreaseQty(product.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary-200 bg-white text-secondary-600 transition hover:bg-secondary-50"
                        >
                          <Minus size={14} />
                        </motion.button>
                        <span className="w-6 text-center text-sm font-bold text-secondary-900">
                          {cartQty}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addToCart(product)}
                          disabled={atMax}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(product)}
                        disabled={outOfStock}
                        className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={13} />
                        {t("addItem")}
                      </motion.button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Cart summary panel */}
      <AnimatePresence>
        {data.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-xl border border-primary-200 bg-primary-50 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary-600" />
              <h3 className="text-sm font-bold text-primary-700">
                Ma sélection
                <span className="ml-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
                  {data.items.length} {t("items")}
                </span>
              </h3>
            </div>

            <ul className="flex flex-col gap-2">
              {data.items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-secondary-100">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                          <span className="text-xs font-bold text-white">
                            {item.product_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="max-w-[160px] truncate text-secondary-700">
                      {item.product_name}
                    </span>
                    <span className="text-secondary-400">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-secondary-900">
                    {(Number(item.unit_price) * item.quantity).toLocaleString("fr-DZ")} DA
                  </span>
                </li>
              ))}
            </ul>

            {/* Subtotal */}
            <div className="mt-3 flex justify-end border-t border-primary-200 pt-3">
              <p className="text-sm font-bold text-primary-700">
                Sous-total :{" "}
                <span className="text-base text-primary-600">
                  {subtotal.toLocaleString("fr-DZ")} DA
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty cart hint */}
      {data.items.length === 0 && !isLoading && (
        <p className="text-center text-sm text-secondary-400">
          {t("emptyCartDesc")}
        </p>
      )}

      {/* Next button */}
      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("next")}
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
