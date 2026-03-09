"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import ProductCard from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/loading-skeleton";
import Pagination from "@/components/shared/pagination";
import { useGetPublicProducts, useGetPublicCategories } from "@/hooks/products";
import type { Product } from "@/types/api";

const SORT_OPTIONS = [
  { value: "-created_at", labelKey: "sortNewest" },
  { value: "price", labelKey: "sortPriceAsc" },
  { value: "-price", labelKey: "sortPriceDesc" },
];

export default function ProductsPage() {
  const t = useTranslations("products");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category_id") ?? ""
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useGetPublicProducts(
    debouncedSearch,
    page,
    categoryId,
    minPrice,
    maxPrice,
    "",
    ordering
  );

  const { data: categoriesData } = useGetPublicCategories();
  const categories = categoriesData?.results ?? [];
  const products = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleAddToOrder = useCallback(
    (product: Product) => {
      try {
        localStorage.setItem("selectedProduct", JSON.stringify(product));
      } catch {
        // ignore storage errors
      }
      router.push("/order-form");
    },
    [router]
  );

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setOrdering("-created_at");
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch || categoryId || minPrice || maxPrice || ordering !== "-created_at";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <PublicNavbar />

      <main className="flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-b border-gray-200 py-8 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {t("title")}
            </h1>
            <p className="text-gray-500">{t("subtitle")}</p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search + filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            {/* Search input */}
            <div className="relative flex-1">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className={`w-full py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                  isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>

            {/* Category select */}
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="py-2.5 px-4 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-w-[160px]"
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort select */}
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className="py-2.5 px-4 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition min-w-[160px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>

            {/* Toggle advanced filters */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex items-center gap-2 py-2.5 px-4 border rounded-lg text-sm font-medium transition ${
                showFilters
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("filters")}
            </button>
          </motion.div>

          {/* Advanced price filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-wrap gap-3 mb-6 p-4 bg-white border border-gray-200 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  {t("minPrice")}
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="0"
                  min={0}
                  className="w-28 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  {t("maxPrice")}
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="99999"
                  min={0}
                  className="w-28 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                  {t("clearFilters")}
                </button>
              )}
            </motion.div>
          )}

          {/* Results count */}
          {!isLoading && (
            <p className="text-sm text-gray-500 mb-4">
              {totalCount} {t("resultsFound")}
            </p>
          )}

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <PackageSearch className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {t("noProducts")}
              </h3>
              <p className="text-gray-400 text-sm max-w-xs">
                {t("noProductsHint")}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-primary-600 hover:underline text-sm font-medium"
                >
                  {t("clearFilters")}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                >
                  <ProductCard
                    product={product}
                    onAddToOrder={() => handleAddToOrder(product)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination
                page={page}
                total={totalCount}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
