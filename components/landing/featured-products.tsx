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
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: "easeOut" as const },
  },
};

export default function FeaturedProducts() {
  const t = useTranslations("featured");
  const { data, isLoading } = useGetFeaturedProducts();

  const products = data?.results ?? [];

  return (
    <section className="bg-secondary-50/90 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs  uppercase tracking-[0.18em] text-primary-600 font-bold">Sélection</p>
          <h2 className="font-display text-4xl font-black text-secondary-900 sm:text-5xl">{t("title")}</h2>
          <p className="mt-3 text-secondary-700">{t("subtitle")}</p>
          <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-primary-600" />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-secondary-500">{t("empty")}</p>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View all */}
        <div className="mt-12 flex justify-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 rounded-2xl border-2 border-primary-600 px-8 py-3.5 text-sm font-bold text-primary-600 transition-all duration-200 hover:bg-primary-600 hover:text-white"
            >
              {t("viewAll")}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
