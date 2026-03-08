"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, HardHat, Wrench, UtensilsCrossed, Pipette } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGetPublicCategories } from "@/hooks/products";
import type { Category } from "@/types/api";

const CATEGORY_CONFIG = [
  {
    gradient: "from-primary-600 to-primary-800",
    icon: <HardHat size={44} className="text-white/80" />,
  },
  {
    gradient: "from-primary-500 to-primary-700",
    icon: <Wrench size={44} className="text-white/80" />,
  },
  {
    gradient: "from-primary-700 to-primary-900",
    icon: <UtensilsCrossed size={44} className="text-white/80" />,
  },
  {
    gradient: "from-primary-600 to-primary-900",
    icon: <Pipette size={44} className="text-white/80" />,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.48, ease: "easeOut" as const },
  },
};

function CategoryCardSkeleton() {
  return <div className="aspect-3/4 animate-pulse rounded-2xl bg-secondary-100 sm:aspect-4/3" />;
}

interface CategoryCardProps {
  category: Category;
  config: (typeof CATEGORY_CONFIG)[0];
}

function CategoryCard({ category, config }: CategoryCardProps) {
  const t = useTranslations("categories");

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/products?category_slug=${category.slug}` as "/products"} className="group block">
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative flex aspect-3/4 w-full flex-col overflow-hidden rounded-2xl bg-linear-to-br ${config.gradient} shadow-md transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary-900/25 sm:aspect-4/3`}
        >
          {/* Bottom darkening overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Centered icon */}
          <div className="flex flex-1 items-center justify-center transition-transform duration-300 group-hover:scale-110">{config.icon}</div>

          {/* Bottom text area */}
          <div className="relative z-10 p-5">
            <h3 className="font-display text-xl font-black text-white drop-shadow-sm">{category.name}</h3>
            <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors group-hover:text-white">
              <span>{t("products")}</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Hover shine */}
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Sestima Confort</p>
            <h2 className="font-display text-4xl font-black text-secondary-100 sm:text-5xl">{t("title")}</h2>
            <p className="mt-2 text-secondary-500">{t("subtitle")}</p>
          </div>
          <Link
            href="/products"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700 sm:mt-0"
          >
            {t("viewAll")}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
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
          <p className="py-12 text-center text-secondary-500">{t("empty")}</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {categories.map((category, idx) => (
              <CategoryCard key={category.id} category={category} config={CATEGORY_CONFIG[idx % CATEGORY_CONFIG.length]} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
