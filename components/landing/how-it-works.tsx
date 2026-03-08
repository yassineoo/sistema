"use client";

import { motion, type Variants } from "framer-motion";
import { ShoppingCart, User, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

interface Step {
  number: number;
  icon: React.ReactNode;
  titleKey: "step1Title" | "step2Title" | "step3Title";
  descKey: "step1Desc" | "step2Desc" | "step3Desc";
}

const steps: Step[] = [
  {
    number: 1,
    icon: <ShoppingCart size={28} className="text-primary-600" />,
    titleKey: "step1Title",
    descKey: "step1Desc",
  },
  {
    number: 2,
    icon: <User size={28} className="text-primary-600" />,
    titleKey: "step2Title",
    descKey: "step2Desc",
  },
  {
    number: 3,
    icon: <Truck size={28} className="text-primary-600" />,
    titleKey: "step3Title",
    descKey: "step3Desc",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section className="bg-secondary-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-secondary-900">
            {t("title")}
          </h2>
          <p className="mt-2 text-secondary-500">{t("subtitle")}</p>
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {/* Connecting dashed line — desktop only */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-10 hidden items-center md:flex"
            aria-hidden="true"
          >
            {/* Line segment between step 1 and 2 */}
            <div className="flex-1" />
            <div className="mx-4 flex-1 border-t-2 border-dashed border-primary-300" />
            <div className="flex-1" />
            <div className="mx-4 flex-1 border-t-2 border-dashed border-primary-300" />
            <div className="flex-1" />
          </div>

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Numbered circle */}
              <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 shadow-lg shadow-primary-600/30">
                {/* Number badge */}
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-primary-600 shadow">
                  {step.number}
                </span>
                {step.icon && (
                  <div className="[&>*]:text-white">{step.icon}</div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-secondary-900">
                {t(step.titleKey)}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-secondary-500">
                {t(step.descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
