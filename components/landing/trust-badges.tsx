"use client";

import { motion, type Variants } from "framer-motion";
import { Truck, ShieldCheck, Zap, Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface BadgeItem {
  icon: React.ReactNode;
  titleKey: "freeDelivery" | "securePayment" | "fastProcessing" | "qualityProducts";
  descKey:
    | "freeDeliveryDesc"
    | "securePaymentDesc"
    | "fastProcessingDesc"
    | "qualityProductsDesc";
}

const badges: BadgeItem[] = [
  {
    icon: <Truck size={32} className="text-primary-600" />,
    titleKey: "freeDelivery",
    descKey: "freeDeliveryDesc",
  },
  {
    icon: <ShieldCheck size={32} className="text-primary-600" />,
    titleKey: "securePayment",
    descKey: "securePaymentDesc",
  },
  {
    icon: <Zap size={32} className="text-primary-600" />,
    titleKey: "fastProcessing",
    descKey: "fastProcessingDesc",
  },
  {
    icon: <Star size={32} className="text-primary-600" />,
    titleKey: "qualityProducts",
    descKey: "qualityProductsDesc",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function TrustBadges() {
  const t = useTranslations("trust");

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4"
      >
        {badges.map((badge) => (
          <motion.div
            key={badge.titleKey}
            variants={cardVariants}
            className="flex flex-col items-center rounded-2xl border border-secondary-100 p-6 text-center backdrop-blur-sm bg-white/80 shadow-sm"
          >
            <div className="mb-3">{badge.icon}</div>
            <h3 className="font-semibold text-secondary-900">
              {t(badge.titleKey)}
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              {t(badge.descKey)}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
