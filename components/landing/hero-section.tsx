"use client";

import { motion, type Variants } from "framer-motion";
import { ChevronDown, Truck, Headphones, Package, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const statsVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.5 },
  },
};

const statItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function HeroSection() {
  const t = useTranslations("hero");

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label"), icon: <Package size={16} />, mobileHide: false },
    { value: t("stat2Value"), label: t("stat2Label"), icon: <Award size={16} />, mobileHide: false },
    { value: null, label: t("stat3Label"), icon: <Truck size={16} />, mobileHide: true },
    { value: null, label: t("stat4Label"), icon: <Headphones size={16} />, mobileHide: true },
  ];

  return (
    <section className="relative flex min-h-[60vh] flex-col overflow-hidden bg-linear-to-br from-primary-600 to-primary-800 lg:min-h-svh">
      {/* ── Layered overlays for depth ───────── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_0%,rgba(255,255,255,0.12)_0%,transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 bg-linear-to-t from-primary-900/50 to-transparent" />

      {/* ── Main content ─────────────────────── */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-4 py-8 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
          {/* Left: Text content */}
          <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
            {/* Brand badge */}
            <motion.div variants={item} className="mb-7 flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/80 badge-pulse" />
                Sestima Confort
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} className="font-display text-3xl font-black leading-none text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {t("title")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={item} className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:mt-6 sm:text-base lg:mx-0 lg:text-lg">
              {t("subtitle")}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-10 lg:justify-start">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-xl shadow-primary-900/20 transition-shadow hover:shadow-2xl"
                >
                  {t("ctaOrder")}
                </Link>
              </motion.div>

            </motion.div>
          </motion.div>

          {/* Right: Hero image */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl" />
              {/* Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-primary-900/40 ring-1 ring-white/20">
                <img src="/hero2.png" alt="Sestima Confort — matériaux, outils, cuisine et plomberie" className="w-full object-cover" />
                {/* Subtle gradient overlay on image */}
                <div className="absolute inset-0 bg-linear-to-tl from-primary-800/30 via-transparent to-transparent" />
              </div>

              {/* Floating badge on the image */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 rounded-2xl border border-white/20 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Livraison dans toutes les wilayas</p>
                <p className="mt-0.5 text-xl font-black text-secondary-900">58 Wilayas</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile scroll indicator */}
      <motion.div
        className="absolute bottom-32 left-0 right-0 hidden justify-center lg:hidden"
        style={{ display: "flex" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} aria-label={t("scrollDown")}>
          <ChevronDown size={28} className="text-white/40" />
        </motion.div>
      </motion.div>

      {/* ── Stats bar ───────────────────────── */}
      <div className="relative z-10 border-t border-white/10 bg-primary-900/40 backdrop-blur-sm">
        <motion.div
          variants={statsVariants}
          initial="hidden"
          animate="show"
          className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-white/10 md:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={statItem}
              className={`flex flex-col items-center gap-1 px-3 py-4 text-center md:gap-1.5 md:px-8 md:py-6 ${stat.mobileHide ? "hidden md:flex" : ""}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/70 md:h-8 md:w-8">{stat.icon}</span>
              {stat.value && <span className="font-display text-2xl font-black leading-none text-white md:text-4xl">{stat.value}</span>}
              <span className={`text-white/60 ${stat.value ? "text-[10px] font-semibold uppercase tracking-wide md:text-xs" : "mt-0.5 text-xs font-medium md:text-sm"}`}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
