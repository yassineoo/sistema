"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/contexts/CartContext";

export default function CartSidebar() {
  const { items, cartCount, cartTotal, updateQty, removeItem, closeCart, isOpen } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-secondary-900/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Sidebar panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-secondary-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary-600" />
                <h2 className="font-display text-lg font-black text-secondary-900">
                  Mon Panier
                </h2>
                {cartCount > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary-500 transition hover:bg-secondary-100 hover:text-secondary-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100">
                    <ShoppingBag size={36} className="text-secondary-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-600">Votre panier est vide</p>
                    <p className="mt-1 text-sm text-secondary-400">Ajoutez des produits pour commencer</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-primary-700"
                  >
                    Découvrir les produits
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <motion.li
                      key={item.product_id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 rounded-xl border border-secondary-100 bg-white p-3 shadow-sm"
                    >
                      {/* Image */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                            <span className="text-lg font-black text-white/80">
                              {item.product_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="line-clamp-2 text-xs font-semibold leading-snug text-secondary-900">
                          {item.product_name}
                        </p>
                        <p className="text-sm font-black text-primary-600">
                          {Number(item.unit_price).toLocaleString("fr-DZ")} DA
                        </p>

                        {/* Qty controls */}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-secondary-200 bg-white text-secondary-600 transition hover:bg-secondary-50"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-secondary-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — totals + CTA */}
            {items.length > 0 && (
              <div className="border-t border-secondary-100 px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-secondary-600">Sous-total</span>
                  <span className="font-display text-xl font-black text-primary-600">
                    {cartTotal.toLocaleString("fr-DZ")} DA
                  </span>
                </div>
                <Link
                  href="/panier"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 font-display text-base font-black text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700"
                >
                  <ShoppingBag size={18} />
                  Voir mon panier
                  <ArrowRight size={16} />
                </Link>
                <p className="mt-2 text-center text-xs text-secondary-400">
                  Livraison calculée à l&apos;étape suivante
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
