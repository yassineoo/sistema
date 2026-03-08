"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGetFeaturedProducts } from "@/hooks/products";
import ProductCard from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/loading-skeleton";

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export default function FeaturedProducts() {
  const t = useTranslations("featured");
  const { data, isLoading } = useGetFeaturedProducts();

  const products = data?.results ?? [];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-secondary-900">
            {t("title")}
          </h2>
          <p className="mt-2 text-secondary-500">{t("subtitle")}</p>
          {/* Green underline accent */}
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary-600" />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-secondary-500">{t("empty")}</p>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View all button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary-600 px-8 py-3 text-sm font-bold text-primary-600 transition-colors hover:bg-primary-600 hover:text-white"
          >
            {t("viewAll")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
