"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingBag } from "lucide-react";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import OrderFormWizard from "@/components/order-form/order-form-wizard";

export default function OrderFormPage() {
  const t = useTranslations("order.form");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [initialProductId, setInitialProductId] = useState<number | undefined>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("selectedProduct");
      if (stored) {
        const product = JSON.parse(stored);
        if (product?.id) {
          setInitialProductId(product.id);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col bg-secondary-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PublicNavbar />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-10 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30">
              <ShoppingBag size={26} className="text-white" />
            </div>
            <h1 className="font-display text-4xl font-black text-secondary-900">
              {t("title")}
            </h1>
            <p className="mt-2 text-secondary-500">
              Remplissez le formulaire ci-dessous pour passer votre commande
            </p>
          </motion.div>

          {/* Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <OrderFormWizard initialProductId={initialProductId} />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
