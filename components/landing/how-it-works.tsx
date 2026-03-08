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
    icon: <ShoppingCart size={30} className="text-white" />,
    titleKey: "step1Title",
    descKey: "step1Desc",
  },
  {
    number: 2,
    icon: <User size={30} className="text-white" />,
    titleKey: "step2Title",
    descKey: "step2Desc",
  },
  {
    number: 3,
    icon: <Truck size={30} className="text-white" />,
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
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
            Simple & Rapide
          </p>
          <h2 className="font-display text-4xl font-black text-secondary-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-secondary-500">{t("subtitle")}</p>
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative grid grid-cols-1 gap-10 md:grid-cols-3"
        >
          {/* Connecting line — desktop */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-12 hidden items-center md:flex"
            aria-hidden="true"
          >
            <div className="flex-1" />
            <div className="mx-6 flex-1 border-t-2 border-dashed border-primary-200" />
            <div className="flex-1" />
            <div className="mx-6 flex-1 border-t-2 border-dashed border-primary-200" />
            <div className="flex-1" />
          </div>

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step circle */}
              <div className="relative mb-6">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-primary-600/15 scale-125" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-600 shadow-xl shadow-primary-600/30">
                  {step.icon}
                </div>
                {/* Number badge */}
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-primary-600 shadow-md ring-2 ring-primary-100">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-xl font-black text-secondary-900">
                {t(step.titleKey)}
              </h3>
              <p className="mt-2 max-w-55 text-sm leading-relaxed text-secondary-500">
                {t(step.descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
