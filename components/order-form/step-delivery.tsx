"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, Home, Building2, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { useGetDeliveryPricing } from "@/hooks/delivery";
import type { DeliveryPricing } from "@/types/api";

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface StepDeliveryProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: string | null | number): string {
  if (value === null || value === undefined || value === "") return "—";
  return `${Number(value).toLocaleString("fr-DZ")} DA`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StepDelivery({
  data,
  onUpdate,
  onNext,
  onBack,
}: StepDeliveryProps) {
  const t = useTranslations("order.form");
  const [wilayaSearch, setWilayaSearch] = useState("");

  const { data: pricingData, isLoading } = useGetDeliveryPricing();
  const allWilayas: DeliveryPricing[] = pricingData ?? [];

  const filteredWilayas = useMemo(() => {
    const q = wilayaSearch.trim().toLowerCase();
    if (!q) return allWilayas;
    return allWilayas.filter(
      (w) =>
        w.wilaya_name.toLowerCase().includes(q) ||
        String(w.wilaya_code).padStart(2, "0").includes(q)
    );
  }, [allWilayas, wilayaSearch]);

  const selectedWilaya =
    data.customer_wilaya_code > 0
      ? allWilayas.find((w) => w.wilaya_code === data.customer_wilaya_code) ?? null
      : null;

  function selectWilaya(wilaya: DeliveryPricing) {
    onUpdate({
      customer_wilaya_code: wilaya.wilaya_code,
      customer_wilaya_name: wilaya.wilaya_name,
      // Reset delivery type/price when wilaya changes
      delivery_type: "home",
      delivery_price: wilaya.home_delivery ?? "",
    });
  }

  function selectDeliveryType(type: "home" | "office") {
    if (!selectedWilaya) return;
    const price =
      type === "home" ? selectedWilaya.home_delivery : selectedWilaya.office_delivery;
    if (price === null) return;
    onUpdate({ delivery_type: type, delivery_price: price });
  }

  const subtotal = data.items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  const deliveryNum =
    data.delivery_price && data.delivery_price !== "" ? Number(data.delivery_price) : 0;
  const total = subtotal + deliveryNum;

  const canGoNext =
    data.customer_wilaya_code > 0 &&
    data.delivery_type !== undefined &&
    data.delivery_price !== "";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Left: Wilaya + Delivery type ─────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        {/* Wilaya search */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700">
            {t("wilaya")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              size={16}
            />
            <input
              type="text"
              value={wilayaSearch}
              onChange={(e) => setWilayaSearch(e.target.value)}
              placeholder={t("wilayaPlaceholder")}
              className="w-full rounded-xl border border-secondary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-secondary-900 placeholder-secondary-400 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Wilaya list */}
          <div className="max-h-56 overflow-y-auto rounded-xl border border-secondary-100 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-lg bg-secondary-100"
                  />
                ))}
              </div>
            ) : filteredWilayas.length === 0 ? (
              <p className="py-6 text-center text-sm text-secondary-400">
                Aucune wilaya trouvée
              </p>
            ) : (
              <ul className="divide-y divide-secondary-50">
                {filteredWilayas.map((wilaya) => {
                  const noDelivery =
                    wilaya.home_delivery === null && wilaya.office_delivery === null;
                  const isSelected =
                    data.customer_wilaya_code === wilaya.wilaya_code;

                  return (
                    <motion.li
                      key={wilaya.wilaya_code}
                      whileHover={noDelivery ? {} : { backgroundColor: "#f0fdf4" }}
                      onClick={() => !noDelivery && selectWilaya(wilaya)}
                      className={`flex cursor-pointer items-center justify-between px-3 py-2.5 transition ${
                        isSelected
                          ? "bg-primary-50"
                          : noDelivery
                          ? "cursor-not-allowed opacity-40"
                          : "hover:bg-secondary-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-xs font-mono font-bold text-secondary-400">
                          {String(wilaya.wilaya_code).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-primary-700" : "text-secondary-800"
                          }`}
                        >
                          {wilaya.wilaya_name}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-secondary-500">
                        <span className="flex items-center gap-1">
                          <Home size={11} />
                          {wilaya.home_delivery !== null
                            ? `${Number(wilaya.home_delivery).toLocaleString("fr-DZ")} DA`
                            : "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 size={11} />
                          {wilaya.office_delivery !== null
                            ? `${Number(wilaya.office_delivery).toLocaleString("fr-DZ")} DA`
                            : "—"}
                        </span>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Delivery type cards */}
        {selectedWilaya && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <label className="text-sm font-semibold text-secondary-700">
              {t("deliveryType")} <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Home delivery card */}
              {(() => {
                const price = selectedWilaya.home_delivery;
                const disabled = price === null;
                const selected = data.delivery_type === "home" && !disabled;
                return (
                  <motion.button
                    type="button"
                    whileTap={disabled ? {} : { scale: 0.98 }}
                    onClick={() => !disabled && selectDeliveryType("home")}
                    disabled={disabled}
                    className={`flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? "border-primary-500 bg-primary-50"
                        : disabled
                        ? "cursor-not-allowed border-secondary-100 bg-secondary-50 opacity-50"
                        : "border-secondary-200 bg-white hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Home
                        size={18}
                        className={selected ? "text-primary-600" : "text-secondary-500"}
                      />
                      <span
                        className={`text-sm font-bold ${
                          selected ? "text-primary-700" : "text-secondary-700"
                        }`}
                      >
                        {t("deliveryHome")}
                      </span>
                    </div>
                    <p className={`text-lg font-black ${selected ? "text-primary-600" : "text-secondary-900"}`}>
                      {disabled ? t("deliveryUnavailable") : fmt(price)}
                    </p>
                  </motion.button>
                );
              })()}

              {/* Office delivery card */}
              {(() => {
                const price = selectedWilaya.office_delivery;
                const disabled = price === null;
                const selected = data.delivery_type === "office" && !disabled;
                return (
                  <motion.button
                    type="button"
                    whileTap={disabled ? {} : { scale: 0.98 }}
                    onClick={() => !disabled && selectDeliveryType("office")}
                    disabled={disabled}
                    className={`flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? "border-primary-500 bg-primary-50"
                        : disabled
                        ? "cursor-not-allowed border-secondary-100 bg-secondary-50 opacity-50"
                        : "border-secondary-200 bg-white hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2
                        size={18}
                        className={selected ? "text-primary-600" : "text-secondary-500"}
                      />
                      <span
                        className={`text-sm font-bold ${
                          selected ? "text-primary-700" : "text-secondary-700"
                        }`}
                      >
                        {t("deliveryOffice")}
                      </span>
                    </div>
                    <p className={`text-lg font-black ${selected ? "text-primary-600" : "text-secondary-900"}`}>
                      {disabled ? t("deliveryUnavailable") : fmt(price)}
                    </p>
                  </motion.button>
                );
              })()}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Right: Order summary ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-xl border border-secondary-100 bg-secondary-50 p-5">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-primary-600" />
          <h3 className="text-sm font-bold text-secondary-800">{t("orderSummary")}</h3>
        </div>

        {/* Items list */}
        <ul className="flex flex-col gap-2">
          {data.items.map((item) => (
            <li
              key={item.product_id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-secondary-200">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                      <span className="text-xs font-bold text-white">
                        {item.product_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="max-w-[140px] truncate text-secondary-700">
                  {item.product_name}
                </span>
                <span className="text-xs text-secondary-400">×{item.quantity}</span>
              </div>
              <span className="font-semibold text-secondary-900">
                {(Number(item.unit_price) * item.quantity).toLocaleString("fr-DZ")} DA
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-secondary-200 pt-3 flex flex-col gap-2">
          {/* Subtotal */}
          <div className="flex justify-between text-sm text-secondary-600">
            <span>Sous-total</span>
            <span className="font-semibold">{subtotal.toLocaleString("fr-DZ")} DA</span>
          </div>

          {/* Delivery */}
          <div className="flex justify-between text-sm text-secondary-600">
            <span>Livraison</span>
            <span className="font-semibold">
              {data.delivery_price ? fmt(data.delivery_price) : "—"}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between border-t border-secondary-200 pt-2 text-base font-black text-secondary-900">
            <span>Total</span>
            <span className="text-primary-600">
              {data.delivery_price ? `${total.toLocaleString("fr-DZ")} DA` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation (full width below the two columns) */}
      <div className="col-span-full flex items-center justify-between pt-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-5 py-3 text-sm font-semibold text-secondary-600 shadow-sm transition hover:bg-secondary-50"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("next")}
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
