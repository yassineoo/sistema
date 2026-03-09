"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  HardHat,
  Wrench,
  UtensilsCrossed,
  Pipette,
  Layers,
  Package,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGetPublicCategories } from "@/hooks/products";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import type { Category } from "@/types/api";

const CATEGORY_CONFIG = [
  { gradient: "from-primary-600 to-primary-800", icon: <HardHat size={48} className="text-white/80" /> },
  { gradient: "from-primary-500 to-primary-700", icon: <Wrench size={48} className="text-white/80" /> },
  { gradient: "from-primary-700 to-primary-900", icon: <UtensilsCrossed size={48} className="text-white/80" /> },
  { gradient: "from-primary-600 to-primary-900", icon: <Pipette size={48} className="text-white/80" /> },
  { gradient: "from-primary-500 to-primary-800", icon: <Layers size={48} className="text-white/80" /> },
  { gradient: "from-primary-700 to-primary-800", icon: <Package size={48} className="text-white/80" /> },
];

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardAnim: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function SkeletonCard() {
  return <div className="aspect-4/3 animate-pulse rounded-2xl bg-secondary-100" />;
}

function CategoryCard({ category, config }: { category: Category; config: (typeof CATEGORY_CONFIG)[0] }) {
  return (
    <motion.div variants={cardAnim}>
      <Link href={`/products?category_slug=${category.slug}` as "/products"} className="group block">
        <motion.div
          whileHover={{ scale: 1.02, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative flex aspect-4/3 w-full flex-col overflow-hidden rounded-2xl bg-linear-to-br ${config.gradient} shadow-md transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary-900/25`}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
          {/* Hover shine */}
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Icon */}
          <div className="flex flex-1 items-center justify-center transition-transform duration-300 group-hover:scale-110">
            {config.icon}
          </div>

          {/* Bottom text */}
          <div className="relative z-10 p-5 sm:p-6">
            <h3 className="font-display text-xl font-black text-white sm:text-2xl">{category.name}</h3>
            {category.description && (
              <p className="mt-1 line-clamp-2 text-sm text-white/70">{category.description}</p>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors group-hover:text-white">
              <span>Voir les produits</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const { data, isLoading } = useGetPublicCategories();
  const categories = data?.results ?? [];

  return (
    <main>
      <PublicNavbar />

      {/* ── Page header ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-600 to-primary-800 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_0%,rgba(255,255,255,0.09)_0%,transparent_70%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
            Sestima Confort
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">
            Explorez nos gammes de produits — matériaux de construction, outillage, cuisine et plomberie. Trouvez exactement ce dont vous avez besoin.
          </p>
        </motion.div>
      </section>

      {/* ── Categories grid ──────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center">
              <Package size={48} className="mx-auto text-secondary-300" />
              <p className="mt-4 text-secondary-500">{t("empty")}</p>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3"
            >
              {categories.map((cat, idx) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  config={CATEGORY_CONFIG[idx % CATEGORY_CONFIG.length]}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Browse all CTA ───────────────────────────────── */}
      <section className="border-t border-secondary-100 bg-secondary-50 px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"
        >
          <div>
            <h3 className="font-display text-xl font-black text-secondary-900 sm:text-2xl">
              Vous ne trouvez pas votre catégorie ?
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Parcourez l'ensemble de notre catalogue produits.
            </p>
          </div>
          <Link
            href="/products"
            className="group flex shrink-0 items-center gap-2 rounded-2xl bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-xl"
          >
            Tous les produits
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
