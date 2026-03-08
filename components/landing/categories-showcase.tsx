"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGetPublicCategories } from "@/hooks/products";
import type { Category } from "@/types/api";

const GRADIENT_PAIRS = [
  "from-primary-600 to-primary-800",
  "from-primary-500 to-primary-700",
  "from-primary-700 to-primary-900",
  "from-emerald-500 to-primary-700",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

function CategoryCardSkeleton() {
  return (
    <div className="aspect-[4/3] animate-pulse rounded-2xl bg-secondary-100" />
  );
}

interface CategoryCardProps {
  category: Category;
  gradientClass: string;
}

function CategoryCard({ category, gradientClass }: CategoryCardProps) {
  const t = useTranslations("categories");

  return (
    <motion.div variants={cardVariants}>
      <Link
        href={`/products?category_slug=${category.slug}` as "/products"}
        className="group block"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass} p-4 shadow-sm`}
        >
          {/* Overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="relative z-10">
            <h3 className="font-bold text-white drop-shadow-sm">
              {category.name}
            </h3>
            <p className="mt-0.5 text-sm text-white/80">
              {t("products")}
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesShowcase() {
  const t = useTranslations("categories");
  const { data, isLoading } = useGetPublicCategories();

  const categories = data?.results ?? [];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-secondary-900">
              {t("title")}
            </h2>
            <p className="mt-1 text-secondary-500">{t("subtitle")}</p>
          </div>
          <Link
            href="/products"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 sm:mt-0"
          >
            {t("viewAll")}
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-secondary-500">{t("empty")}</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {categories.map((category, idx) => (
              <CategoryCard
                key={category.id}
                category={category}
                gradientClass={GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length]}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
