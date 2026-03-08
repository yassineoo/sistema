"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Tag, Package } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import ProductCard from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/loading-skeleton";
import { useGetProductBySlug, useGetPublicProducts } from "@/hooks/products";
import type { Product } from "@/types/api";

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
          <div className="h-12 bg-gray-200 rounded-xl w-full mt-6" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const t = useTranslations("products");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading, isError } = useGetProductBySlug(slug);

  const categorySlug = product?.category?.slug ?? "";
  const { data: relatedData } = useGetPublicProducts(
    "",
    1,
    categorySlug,
    "",
    "",
    "",
    "-created_at"
  );
  const relatedProducts = (relatedData?.results ?? []).filter(
    (p) => p.slug !== slug
  ).slice(0, 4);

  const handleAddToOrder = (p: Product) => {
    try {
      localStorage.setItem("selectedProduct", JSON.stringify(p));
    } catch {
      // ignore storage errors
    }
    router.push("/order-form");
  };

  const allImages = product
    ? [
        ...(product.main_image ? [product.main_image] : []),
        ...product.images.filter((img) => img !== product.main_image),
      ]
    : [];

  const currentImage = allImages[selectedImageIndex] ?? null;
  const hasDiscount =
    product?.compare_price &&
    parseFloat(product.compare_price) > parseFloat(product.price ?? "0");

  const discountPercent =
    hasDiscount && product
      ? Math.round(
          ((parseFloat(product.compare_price!) - parseFloat(product.price)) /
            parseFloat(product.compare_price!)) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <PublicNavbar />

      <main className="flex-1">
        {/* Back link */}
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            {t("backToProducts")}
          </Link>
        </div>

        {isLoading ? (
          <DetailSkeleton />
        ) : isError || !product ? (
          <div className="max-w-6xl mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {t("productNotFound")}
            </h2>
            <p className="text-gray-400 text-sm">{t("productNotFoundHint")}</p>
            <Link
              href="/products"
              className="mt-6 inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition"
            >
              {t("backToProducts")}
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-4 py-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-2xl shadow-sm p-6 md:p-10">
              {/* Left: Image gallery */}
              <div className="space-y-4">
                {/* Main image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discountPercent}%
                    </div>
                  )}
                  {/* Image navigation arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === 0 ? allImages.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === allImages.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImageIndex(i)}
                        className={`flex-none w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                          selectedImageIndex === i
                            ? "border-primary-500"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product info */}
              <div className="flex flex-col">
                {/* Category */}
                {product.category && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Tag className="w-3.5 h-3.5 text-primary-500" />
                    <Link
                      href={`/products?category_slug=${product.category.slug}`}
                      className="text-sm text-primary-600 hover:underline font-medium"
                    >
                      {product.category.name}
                    </Link>
                  </div>
                )}

                {/* Name */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    {parseFloat(product.price).toLocaleString()} {t("currency")}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">
                      {parseFloat(product.compare_price!).toLocaleString()} {t("currency")}
                    </span>
                  )}
                </div>

                {/* Stock badge */}
                <div className="mb-5">
                  {product.stock > 10 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      {t("inStock")}
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      {t("lowStock", { count: product.stock })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      {t("outOfStock")}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      {t("description")}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={product.stock === 0}
                    onClick={() => handleAddToOrder(product)}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition ${
                      product.stock === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.stock === 0 ? t("outOfStock") : t("addToOrder")}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <div className="mt-14">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {t("relatedProducts")}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.06 }}
                    >
                      <ProductCard
                        product={p}
                        onAddToOrder={() => handleAddToOrder(p)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
