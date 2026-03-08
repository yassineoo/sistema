"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Check, PackageSearch, User, Truck, ClipboardList, CheckCircle, RotateCcw } from "lucide-react";
import { Link } from "@/i18n/navigation";
import StepProducts from "./step-products";
import StepCustomer from "./step-customer";
import StepDelivery from "./step-delivery";
import StepConfirm from "./step-confirm";

// ── Shared wizard types ───────────────────────────────────────────────────────

type CartItem = {
  product_id: number;
  product_name: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
  stock: number;
};

type WizardData = {
  items: CartItem[];
  customer_name: string;
  customer_phone: string;
  customer_phone2: string;
  customer_wilaya_code: number;
  customer_wilaya_name: string;
  customer_address: string;
  delivery_type: "home" | "office";
  delivery_price: string;
};

// ── Initial state ─────────────────────────────────────────────────────────────

function makeInitialData(): WizardData {
  return {
    items: [],
    customer_name: "",
    customer_phone: "",
    customer_phone2: "",
    customer_wilaya_code: 0,
    customer_wilaya_name: "",
    customer_address: "",
    delivery_type: "home",
    delivery_price: "",
  };
}

// ── Slide variants ────────────────────────────────────────────────────────────

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: { duration: 0.28, ease: "easeIn" },
  }),
};

// ── Success overlay variants ──────────────────────────────────────────────────

const successOverlayVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const checkmarkVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.15 },
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface OrderFormWizardProps {
  initialProductId?: number;
}

// ── Step config ───────────────────────────────────────────────────────────────

interface StepConfig {
  key: string;
  labelKey: "step1" | "step2" | "step3" | "step4";
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { key: "products", labelKey: "step1", icon: <PackageSearch size={16} /> },
  { key: "customer", labelKey: "step2", icon: <User size={16} /> },
  { key: "delivery", labelKey: "step3", icon: <Truck size={16} /> },
  { key: "confirm", labelKey: "step4", icon: <ClipboardList size={16} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrderFormWizard({ initialProductId }: OrderFormWizardProps) {
  const t = useTranslations("order.form");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [step, setStep] = useState(1); // 1-indexed
  const [direction, setDirection] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(makeInitialData);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...partial }));
  }, []);

  function goNext() {
    setDirection(isRTL ? -1 : 1);
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() {
    setDirection(isRTL ? 1 : -1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSuccess(orderNumber: string) {
    setSuccessOrderNumber(orderNumber);
  }

  function handleNewOrder() {
    setWizardData(makeInitialData());
    setStep(1);
    setDirection(1);
    setSuccessOrderNumber(null);
  }

  // ── Progress indicator ──────────────────────────────────────────────────────

  function ProgressBar() {
    return (
      <div className="mb-8 flex items-center justify-center gap-0" dir={isRTL ? "rtl" : "ltr"}>
        {STEPS.map((s, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < step;
          const isActive = stepNum === step;
          const isFuture = stepNum > step;

          return (
            <div key={s.key} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={
                    isActive
                      ? { scale: 1.1, boxShadow: "0 0 0 4px rgba(15,157,88,0.15)" }
                      : { scale: 1, boxShadow: "none" }
                  }
                  transition={{ duration: 0.2 }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "border-primary-600 bg-primary-600 text-white"
                      : isActive
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-secondary-200 bg-white text-secondary-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={2.5} />
                  ) : (
                    <span className="text-xs font-bold">{stepNum}</span>
                  )}
                </motion.div>

                {/* Step label */}
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    isActive
                      ? "text-primary-600"
                      : isCompleted
                      ? "text-primary-500"
                      : "text-secondary-400"
                  }`}
                >
                  {t(s.labelKey)}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`mx-1 mt-[-18px] h-0.5 w-10 sm:w-16 transition-colors ${
                    stepNum < step ? "bg-primary-500" : "bg-secondary-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Success overlay ─────────────────────────────────────────────────────────

  if (successOrderNumber !== null) {
    return (
      <motion.div
        variants={successOverlayVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-primary-100 bg-white p-10 text-center shadow-lg"
      >
        {/* Animated checkmark */}
        <motion.div
          variants={checkmarkVariants}
          initial="hidden"
          animate="visible"
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50"
        >
          <CheckCircle size={56} className="text-primary-600" strokeWidth={1.5} />
        </motion.div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-secondary-900">{t("successTitle")}</h2>
          <p className="text-secondary-500">{t("successDesc")}</p>
        </div>

        {/* Order number */}
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-6 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
            {t("successOrderNumber")}
          </p>
          <p className="mt-1 text-xl font-black tracking-widest text-primary-700">
            {successOrderNumber}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/track/${successOrderNumber}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700"
          >
            {t("trackOrder")}
          </Link>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleNewOrder}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary-200 bg-white px-6 py-3 text-sm font-semibold text-secondary-600 shadow-sm transition hover:bg-secondary-50"
          >
            <RotateCcw size={15} />
            {t("newOrder")}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Main wizard layout ──────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
      {/* Progress indicator */}
      <ProgressBar />

      {/* Step panel */}
      <div className="relative overflow-hidden rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm sm:p-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 1 && (
              <StepProducts
                data={wizardData}
                onUpdate={updateData}
                onNext={goNext}
                initialProductId={initialProductId}
              />
            )}
            {step === 2 && (
              <StepCustomer
                data={wizardData}
                onUpdate={updateData}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 3 && (
              <StepDelivery
                data={wizardData}
                onUpdate={updateData}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {step === 4 && (
              <StepConfirm
                data={wizardData}
                onBack={goBack}
                onSuccess={handleSuccess}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
