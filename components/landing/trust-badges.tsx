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
    icon: <Truck size={28} className="text-primary-600" />,
    titleKey: "freeDelivery",
    descKey: "freeDeliveryDesc",
  },
  {
    icon: <ShieldCheck size={28} className="text-primary-600" />,
    titleKey: "securePayment",
    descKey: "securePaymentDesc",
  },
  {
    icon: <Zap size={28} className="text-primary-600" />,
    titleKey: "fastProcessing",
    descKey: "fastProcessingDesc",
  },
  {
    icon: <Star size={28} className="text-primary-600" />,
    titleKey: "qualityProducts",
    descKey: "qualityProductsDesc",
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
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function TrustBadges() {
  const t = useTranslations("trust");

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
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
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-secondary-100 bg-white p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-secondary-900/6"
          >
            {/* Icon circle */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              {badge.icon}
            </div>
            <div>
              <h3 className="font-bold text-secondary-900">
                {t(badge.titleKey)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-secondary-500">
                {t(badge.descKey)}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
