"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  ShoppingCart, Package, Tag, Minus, Plus,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import ProductCard from "@/components/shared/product-card";
import { useGetProductBySlug, useGetPublicProducts } from "@/hooks/products";
import { useCart } from "@/contexts/CartContext";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
      <div className="mb-8 h-8 w-48 rounded-xl bg-secondary-100" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="h-96 rounded-2xl bg-secondary-100" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-secondary-100" />
          <div className="h-48 rounded-2xl bg-secondary-100" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  const { addItem, openCart } = useCart();

  const { data: product, isLoading, isError } = useGetProductBySlug(slug);

  const { data: relatedData } = useGetPublicProducts(
    "", 1, String(product?.subcategory?.category?.id ?? ""), "", "", "", "-created_at"
  );
  const relatedProducts = (relatedData?.results ?? []).filter((p) => p.slug !== slug).slice(0, 4);

  const allImages = product
    ? [
        ...(product.main_image ? [product.main_image] : []),
        ...product.gallery.map((g) => g.image).filter((img) => img !== product.main_image),
      ]
    : [];

  const hasDiscount = product?.compare_price && parseFloat(product.compare_price) > parseFloat(product.price ?? "0");
  const discountPct = hasDiscount && product
    ? Math.round(((parseFloat(product.compare_price!) - parseFloat(product.price)) / parseFloat(product.compare_price!)) * 100)
    : 0;

  function buildCartItem() {
    if (!product) return null;
    return {
      product_id: product.id,
      product_name: product.name,
      product_image: product.main_image ?? product?.gallery?.[0]?.image ?? null,
      unit_price: product.price,
      stock: product.stock,
      slug: product.slug,
    };
  }

  function handleBuyNow() {
    const item = buildCartItem();
    if (!item) return;
    for (let i = 0; i < qty; i++) addItem(item);
    router.push("/panier");
  }

  function handleAddToCart() {
    const item = buildCartItem();
    if (!item) return;
    for (let i = 0; i < qty; i++) addItem(item);
    openCart();
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary-50" dir={isRTL ? "rtl" : "ltr"}>
      <PublicNavbar />

      <main className="flex-1">

        {/* ── Loading ── */}
        {isLoading && <DetailSkeleton />}

        {/* ── Not found ── */}
        {!isLoading && (isError || !product) && (
          <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-100">
              <Package className="h-10 w-10 text-secondary-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-secondary-700">Produit introuvable</h2>
            <p className="mb-6 text-sm text-secondary-400">Ce produit a été retiré du catalogue.</p>
            <Link href="/products" className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-primary-700">
              Retour aux produits
            </Link>
          </div>
        )}

        {/* ── Product detail ── */}
        {!isLoading && product && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

            {/* Name banner */}
            <div className="border-b border-secondary-100 bg-white px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <Link href="/products"
                  className="mb-3 inline-flex items-center gap-1.5 text-sm text-secondary-400 transition hover:text-primary-600">
                  {isRTL ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                  Retour aux produits
                </Link>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  {product.subcategory && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      <Tag size={11} />{product.subcategory.name}
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">★ En vedette</span>
                  )}
                </div>
                <h1 className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">{product.name}</h1>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">

                {/* ─── LEFT: Image gallery ──────────────────── */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="relative aspect-square">
                    {allImages[selectedImage] ? (
                      <img src={allImages[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-600 to-primary-800">
                        <span className="font-display text-8xl font-black text-white/30">{product.name.charAt(0)}</span>
                      </div>
                    )}
                    {hasDiscount && (
                      <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow">
                        -{discountPct}%
                      </div>
                    )}
                    {allImages.length > 1 && (
                      <>
                        <button onClick={() => setSelectedImage((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white">
                          <ChevronLeft size={18} className="text-secondary-700" />
                        </button>
                        <button onClick={() => setSelectedImage((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow transition hover:bg-white">
                          <ChevronRight size={18} className="text-secondary-700" />
                        </button>
                      </>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-3">
                      {allImages.map((img, i) => (
                        <button key={i} onClick={() => setSelectedImage(i)}
                          className={`h-16 w-16 flex-none overflow-hidden rounded-lg border-2 transition ${
                            selectedImage === i ? "border-primary-500" : "border-transparent opacity-60 hover:opacity-100"
                          }`}>
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ─── RIGHT: Price + Add to cart ──────────── */}
                <div className="sticky top-24 flex flex-col gap-4">

                  {/* Price card */}
                  <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-display text-3xl font-black text-primary-600">
                        {Number(product.price).toLocaleString("fr-DZ")} DA
                      </span>
                      {hasDiscount && (
                        <span className="text-base text-secondary-400 line-through">
                          {Number(product.compare_price).toLocaleString("fr-DZ")} DA
                        </span>
                      )}
                    </div>

                    {product.stock > 10 ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> En stock
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> Plus que {product.stock} en stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        <span className="h-2 w-2 rounded-full bg-red-500" /> Rupture de stock
                      </span>
                    )}
                  </div>

                  {/* Quantity selector */}
                  {product.stock > 0 && (
                    <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-secondary-500">Quantité</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-200 bg-white text-secondary-600 shadow-sm transition hover:bg-secondary-50 active:scale-95"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-10 text-center font-display text-2xl font-black text-secondary-900">{qty}</span>
                        <button
                          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-200 bg-white text-secondary-600 shadow-sm transition hover:bg-secondary-50 active:scale-95"
                        >
                          <Plus size={16} />
                        </button>
                        <span className="text-xs text-secondary-400">{product.stock} disponibles</span>
                      </div>
                    </div>
                  )}

                  {/* CTA buttons */}
                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={handleBuyNow}
                      disabled={product.stock === 0}
                      whileHover={{ scale: product.stock === 0 ? 1 : 1.01 }}
                      whileTap={{ scale: product.stock === 0 ? 1 : 0.97 }}
                      className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 font-display text-lg font-black text-white shadow-lg transition-all ${
                        product.stock === 0
                          ? "cursor-not-allowed bg-secondary-300"
                          : "bg-primary-600 shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/25"
                      }`}
                    >
                      <ShoppingCart size={22} />
                      {product.stock === 0 ? "Rupture de stock" : "Commander maintenant"}
                    </motion.button>

                    {product.stock > 0 && (
                      <motion.button
                        onClick={handleAddToCart}
                        whileTap={{ scale: 0.97 }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary-600 py-3.5 font-display text-base font-bold text-primary-600 transition hover:bg-primary-50"
                      >
                        <ShoppingCart size={18} />
                        Ajouter au panier
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Description ── */}
              {product.description && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="mt-12 rounded-2xl border border-secondary-100 bg-white p-8 shadow-sm"
                >
                  <h2 className="font-display mb-4 text-2xl font-black text-secondary-900">Description du produit</h2>
                  <div className="mb-6 h-0.5 w-12 rounded-full bg-primary-600" />
                  <p className="whitespace-pre-line leading-relaxed text-secondary-600">{product.description}</p>
                </motion.div>
              )}

              {/* ── Related products ── */}
              {relatedProducts.length > 0 && (
                <div className="mt-14">
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className="font-display text-2xl font-black text-secondary-900">Vous aimerez aussi</h2>
                    <div className="h-px flex-1 bg-secondary-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {relatedProducts.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.07 }}>
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
