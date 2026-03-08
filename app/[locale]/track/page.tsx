"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Search, Package } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";

export default function TrackPage() {
  const t = useTranslations("order");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;
    router.push(`/track/${trimmed}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-primary-600" />
            </div>
          </motion.div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t("trackTitle")}
            </h1>
            <p className="text-gray-500 leading-relaxed">{t("trackSubtitle")}</p>
          </div>

          {/* Search form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 space-y-4"
          >
            <div>
              <label
                htmlFor="orderNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("orderNumber")}
              </label>
              <div className="relative">
                <Search
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${
                    isRTL ? "right-3" : "left-3"
                  }`}
                />
                <input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t("trackPlaceholder")}
                  autoComplete="off"
                  className={`w-full py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  }`}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={!orderNumber.trim()}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold transition ${
                orderNumber.trim()
                  ? "bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <Search className="w-4 h-4" />
              {t("trackButton")}
            </motion.button>
          </motion.form>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-gray-400 mt-4"
          >
            {t("trackHint")}
          </motion.p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
